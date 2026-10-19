import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/index.js";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//login
export const login = async function (req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ where: { email: email } });

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // console.log("Token -> ", token);
    return res.json({
      success: true,
      message: "Login successfully",
      data: { name: user.name, email: user.email, token: token },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//google login
export const googleLogin = async function (req, res) {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "idToken is required" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;

    let user = await User.findOne({ where: { googleId: googleId } });

    if (!user) {
      user = await User.findOne({ where: { email: payload.email } });

      if (user) {
        user.googleId = googleId;
        await user.save();
      } else {
        user = await User.create({
          name: payload.name,
          email: payload.email,
          googleId: googleId,
        });
      }
    }

    const jwtpayload = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const token = jwt.sign(jwtpayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("Token -> ", token);
    // console.log("data ->", user)
    // console.log("data ->", user.dataValues.name)
    // console.log("data ->", user.dataValues.email)

    return res.json({
      success: true,
      message: "Login successfully",
      data: {
        name: user.dataValues.name,
        email: user.dataValues.email,
        token: token,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(401).json({ message: "Invalid Google token" });
  }
};
