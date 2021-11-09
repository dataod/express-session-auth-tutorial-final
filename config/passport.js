const logger = require("../logger");
const User = require("../db/user");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const moment = require("moment");
const helpers = require("../utils/helpers");

require("dotenv").config();

module.exports = function (passport) {
  // Local strategy
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) {
          logger.error(
            { err: err },
            { clientIp: req.ip },
            "Error in Local strategy finding user."
          );
          return done(err);
        }
        if (!user) {
          logger.info(
            { err: err },
            { clientIp: req.ip },
            `Email ${email} not registered.`
          );
          return done(null, false, {
            msg: `Email ${email} is not registered.`,
          });
        }
        user.comparePassword(password, (err, isMatch) => {
          if (err) {
            logger.error(
              { err: err },
              { clientIp: req.ip },
              "Error in Local strategy password comparison."
            );
            return done(err);
          }
          if (isMatch) {
            return done(null, user);
          }
          logger.warn({ clientIp: req.ip }, "Incorrect password.");
          return done(null, false, { msg: "Incorrect email or password." });
        });
      });
    })
  );

  /**
   *  GOOGLE passport strategy
   */
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: "/auth/google-callback",
        passReqToCallback: true,
      },
      (req, accessToken, refreshToken, params, profile, done) => {
        // if logged in
        if (req.user) {
          User.findOne({ googleId: profile.id }, (err, existingUser) => {
            if (err) {
              logger.error(
                { err: err },
                { clientIp: req.ip },
                "Error Google strategy."
              );
              return done(err);
            }
            if (existingUser && existingUser.id !== req.user.id) {
              return done(null, false, {
                msg: "There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.",
              });
            } else {
              User.findById(req.user.id, (err, user) => {
                if (err) {
                  return done(err);
                }
                user.googleId = profile.id;
                user.tokens.push({
                  kind: "google",
                  accessToken,
                  accessTokenExpires: moment()
                    .add(params.expires_in, "seconds")
                    .format(),
                  refreshToken,
                });
                //https://stackoverflow.com/questions/18371339/how-to-retrieve-name-from-email-address/18371753
                // Making username out of 1st part of the email
                const username = profile._json.email.substring(
                  0,
                  profile._json.email.lastIndexOf("@")
                );
                // More data available from profile
                user.username = username;
                user.emailVerified = true;
                user.emailVerificationToken = "";

                const sessionUser = helpers.sessionizeUser(user);
                req.session.user = sessionUser;

                user.save((err) => {
                  done(err, user);
                });
              });
            }
          });
        } else {
          User.findOne({ googleId: profile.id }, (err, existingUser) => {
            if (err) {
              return done(err);
            }
            // If email already registered
            if (existingUser) {
              const sessionUser = helpers.sessionizeUser(existingUser);
              req.session.user = sessionUser;
              return done(null, existingUser);
            }
            User.findOne(
              { email: profile._json.email },
              (err, existingEmailUser) => {
                if (err) {
                  return done(err);
                }
                // If email already registered with another strategy
                if (existingEmailUser && profile._json.email_verified) {
                  existingEmailUser.googleId = profile.id;
                  existingEmailUser.tokens.push({
                    kind: "google",
                    accessToken,
                    accessTokenExpires: moment()
                      .add(params.expires_in, "seconds")
                      .format(),
                    refreshToken,
                  });
                  existingEmailUser.username = profile.displayName;
                  existingEmailUser.emailVerified = true;
                  existingEmailUser.emailVerificationToken = "";

                  const sessionUser = helpers.sessionizeUser(existingEmailUser);
                  req.session.user = sessionUser;
                  existingEmailUser.save((err) => {
                    done(err, existingEmailUser);
                  });

                  return done(null, existingEmailUser);
                } else {
                  // Creating fresh user account
                  const user = new User();
                  user.email = profile._json.email;
                  user.googleId = profile.id;
                  user.tokens.push({
                    kind: "google",
                    accessToken,
                    accessTokenExpires: moment()
                      .add(params.expires_in, "seconds")
                      .format(),
                    refreshToken,
                  });
                  user.emailVerified = true;
                  //https://stackoverflow.com/questions/18371339/how-to-retrieve-name-from-email-address/18371753
                  // Making username out of 1st part of the email
                  const username = profile._json.email.substring(
                    0,
                    profile._json.email.lastIndexOf("@")
                  );
                  user.username = username;

                  const sessionUser = helpers.sessionizeUser(user);
                  req.session.user = sessionUser;

                  user.save((err) => {
                    done(err, user);
                  });
                }
              }
            );
          });
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
