const logger = require("../logger");
const User = require("../db/user");
const helpers = require("../utils/helpers");
const mailChecker = require("mailchecker");
const emailSchema = require("../validations/emailSchema");
const tokenSchema = require("../validations/tokenSchema");
const passwordSchema = require("../validations/passwordSchema");

const { promisify } = require("util");
const crypto = require("crypto");
const randomBytesAsync = promisify(crypto.randomBytes);
const emails = require("../emails");

module.exports = {
  /**
   *  POST /email-verification
   *  Verifying email address with token
   */
  async postVerification(req, res, next) {
    try {
      if (req.user && req.user.emailVerified) {
        return res.send({ msg: "Your email is Verified." });
      }
      // token Validation
      if (req.body.token) {
        await tokenSchema.validateAsync({
          token: req.body.token,
        });
      }
      //
      // If user is logged in
      if (req.user && req.body.token === req.user.emailVerificationToken) {
        User.findOne({ email: req.user.email })
          .then((user) => {
            if (!user) {
              logger.error(
                "There was an error during loading of the account.",
                { clientIp: req.ip }
              );
              return res.status(400).send({
                msg: "There was an error during loading of your account.",
              });
            }
            user.emailVerificationToken = "";
            user.emailVerified = true;

            const sessionUser = helpers.sessionizeUser(user);
            req.session.user = sessionUser;
            res.send(sessionUser);

            user = user.save();
          })
          .catch((err) => {
            logger.error(
              { err: err },
              "Error saving the user profile to the database after email verification",
              { clientIp: req.ip }
            );
            return res.send({
              msg: "There was a problem during updating your account. Please try again later.",
            });
          });
      }
      // If user is not logged in
      if (!req.user && req.body.token) {
        await User.findOne(
          { emailVerificationToken: req.body.token },
          (err, user) => {
            if (err) {
              return next(err);
            }
            if (!user) {
              return res.status(400).send({
                msg: "There was an error during loading of your account.",
              });
            } else {
              req.logIn(user, (err) => {
                if (err) {
                  return next(err);
                }
                user.emailVerificationToken = "";
                user.emailVerified = true;

                const sessionUser = helpers.sessionizeUser(user);
                req.session.user = sessionUser;
                res.send(sessionUser);

                user = user.save();
              });
            }
          }
        );
      }
    } catch (err) {
      logger.error(
        { err: err },
        { clientIp: req.ip },
        "Email Verification error."
      );
      res.status(401).send(err);
    }
  },

  /**
   *  POST /forgot-pw
   *  Create a random token and send it to user with a reset link
   */

  async postForgotPassword(req, res, next) {
    try {
      // Email Validation
      if (!mailChecker.isValid(req.body.email)) {
        await logger.warn(
          req.body.email,
          { meta: "mailChecker" },
          { clientIp: req.ip },
          "Tried to register, but was denied by mailChecker"
        );
        return res.status(401).send({
          msg: "Sorry, the email you provided is blacklisted.",
        });
      }

      await emailSchema.validateAsync({
        email: req.body.email,
      });
      //

      // Find user -> asign token and expiration of 1 hour
      User.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
          res.status(400).send({ msg: "Email is not registered." });
        }
        if (!user.emailVerified) {
          res.status(400).send({
            msg: "Please verify your email before requesting password reset.",
          });
        } else if (user.passwordResetToken) {
          res.status(400).send({
            msg: `Your account already requested password reset.\n
  Please check your email.`,
          });
        } else {
          // Generating random token
          const createRandomToken = randomBytesAsync(16).then((buf) =>
            buf.toString("hex")
          );
          // Save token and set expiration
          const setRandomToken = (token) => {
            user.passwordResetToken = token;
            user.passwordResetExpires = Date.now() + 3600000; // 1 hour
            user = user.save();
            return user;
          };
          // Send email with reset link
          const sendEmail = (data) => {
            emails.sendPasswordReset(req.body.email, data.passwordResetToken);
            return res.send({
              msg: "Check your email for password reset link.",
            });
          };
          createRandomToken.then(setRandomToken).then(sendEmail).catch(next);
        }
      });
    } catch (err) {
      logger.error({ err: err }, { clientIp: req.ip });
      res.status(400).send(err);
    }
  },

  /**
   *  POST /password-reset
   *  Process the reset password request
   */

  async postPasswordReset(req, res, next) {
    try {
      // Validation
      await passwordSchema.validateAsync({
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
      });
      if (req.body.password !== req.body.confirmPassword) {
        res.status(400).send({ msg: "Passwords don't match." });
      }
      //
      const resetPassword = () => {
        User.findById(req.user.id, (err, user) => {
          if (err) {
            return next(err);
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;

          // Send email with change confirmation
          emails.sendPWChangeConfirmation(user.email);

          const sessionUser = helpers.sessionizeUser(user);
          req.session.user = sessionUser;
          res.send(sessionUser);

          user.save((err) => {
            if (err) {
              logger.error(
                { err: err },
                { clientIp: req.ip },
                "Password reset user save error."
              );
              return next(err);
            }
          });
        });
      };

      resetPassword();
    } catch (err) {
      logger.error({ err: err }, { clientIp: req.ip }, "Password reset error.");
      res.status(400).send({ msg: "Something went wrong." });
    }
  },
};
