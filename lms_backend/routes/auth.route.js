var express = require("express");
var authController = require("../controllers/authController");
var router = express.Router();
var passport = require("../config/passport");
const { auth } = require("../middleware/auth");

router.get("/login.html", authController.loginPage);
router.post("/login", authController.login);
router.po

//OAuth
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login.html",
  }),
  function (req, res) {
    // passport put the user from done(null, user) onto req.user
    var user = req.user;

    req.session.userId = user.id;
    req.session.name = user.name;
    req.session.email = user.email;

    // same three lines as the password login
    var token = jwt.sign(
      { email: user.email, id: user.id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );
    req.session.token = token;

    res.redirect("/book-list.html");
  },
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login.html?error=1",
  }),
  function (req, res) {
    req.session.userId = req.user.id;
    req.session.name = req.user.name;
    req.session.email = req.user.email;
    res.redirect("/book-list.html");
  },
);

module.exports = router;
