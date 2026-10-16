import jwt from "jsonwebtoken";

export const auth = async function (req, res, next) {
  try {
    const token = req.get("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied, No TOKEN found!!!",
      });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decode;

    next();
  } catch (error) {
    console.error("JWT verification Error: ", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};
