var path = require("path");
var bcrypt = require("bcrypt");
var User = require("../models/user.model");
var jwt = require("jsonwebtoken");

//login page
exports.loginPage = function (req, res) {
  res.sendFile(path.join(__dirname, "..", "html", "login.html"));
};

//login
exports.login = async function (req, res) {
  var email = req.body.email;
  var password = req.body.password;

  try {
    var user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res.redirect("/login.html?error=1");
    }

    var match = await bcrypt.compare(password, user.password);

    // console.log("Password match:", match);

    if (!match) {
      return res.redirect("/login.html?error=1");
    }

    //generating jwt token
    const payload = {
      email: user.email,
      id: user.id,
      name: user.name,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    req.session.userId = user.id;
    req.session.name = user.name;
    req.session.email = user.email;
    req.session.token = token;

    console.log("token -> ", token);

    // console.log('LOGIN  ->', req.sessionID, req.session.userId);
    res.redirect("/book-list.html");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Something went wrong");
  }
};

//logout
exports.logout = async function (req, res) {
  try {
    req.session.userId = undefined;
    req.session.name = undefined;
    req.session.email = undefined;
    req.session.token = undefined;
    return res.status(200).json({
      success: true,
      message: "Logout successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Something Went wrong while logout");
  }
};
