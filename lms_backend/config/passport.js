var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20").Strategy;
var User = require("../models/user.model");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        var email = profile.emails[0].value;

        var user = await User.findOne({ where: { googleId: profile.id } });

        if (user) {
          return done(null, user);
        }

        user = await User.findOne({ where: { email: email } });

        if (user) {
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        user = await User.create({
          name: profile.displayName,
          email: email,
          googleId: profile.id,
          password: null,
        });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

module.exports = passport;
