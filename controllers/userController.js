const logger = require("../logger");
const User = require("../db/user");
const passwordSchema = require("../validations/passwordSchema");
const tokenSchema = require("../validations/tokenSchema");
const helpers = require("../utils/helpers");
const { stringify } = require("querystring");

module.exports = {
  /**
   *   POST /account/password
   *   Change current password
   */
  async postChangePassword(req, res, next) {
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
      await User.findById(req.user.id, (err, user) => {
        if (err) {
          return next(err);
        }
        user.password = req.body.password;
        user.save((err) => {
          if (err) {
            logger.error(
              { err: err },
              { clientIp: req.ip },
              "User save error."
            );
            return next(err);
          }
          res.status(200).send({ msg: "Password successfully changed." });
        });
      });
    } catch (err) {
      logger.error(
        { err: err },
        { clientIp: req.ip },
        "Error in postChangePassword"
      );
      res.status(400).send({ msg: "Something went wrong." });
    }
  },


  /**
   *  POST /password-reset/request
   *  Reset password page processing
   */
  async postResetRequest(req, res, next) {
    try {
      // Token Validation
      if (req.body.token) {
        await tokenSchema.validateAsync({
          token: req.body.token,
        });
      }
      //
      User.findOne({ passwordResetToken: req.body.token }, (err, user) => {
        // unexpected errors
        if (err) {
          return next(err);
        }
        // if user with this token was not found
        if (!user) {
          return res
            .status(400)
            .send({ msg: "Token is invalid or it's expired." });
        }

        // Valid token
        if (user.passwordResetExpires > Date.now()) {
          req.logIn(user, (err) => {
            if (err) {
              return next(err);
            }

            const sessionUser = helpers.sessionizeUser(user);
            req.session.user = sessionUser;
            res.send(sessionUser);
          });
        }
      });
    } catch (err) {
      logger.error(
        { err: err },
        { clientIp: req.ip },
        "Error in postResetRequest"
      );
      res.status(400).send({ msg: "Something went wrong." });
    }
  },

  /**
   *  POST /recaptcha-verify
   *  ReCAPTCHA test
   */
  async postReCAPTCHA(req, res, next) {
    try {
      if (!req.body.captcha) {
        return await res.json({
          success: false,
          msg: "Please complete reCAPTCHA test",
        });
      }

      // Verify URL
      const query = stringify({
        secret: process.env.RECAPTCHA_SECRET_KEY_V2,
        response: req.body.captcha,
        remoteip: req.connection.remoteAddress,
      });

      const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;

      // Make request to verifyURL
      const body = await fetch(verifyURL).then((res) => res.json());

      // If not successful
      if (body.success !== undefined && !body.success) {
        return res.json({
          success: false,
          msg: "Unsuccessful reCAPATCHA check.",
        });
      }
      // if successful
      return await res.json({ success: true, msg: "Successful check." });
    } catch (err) {
      logger.error(
        { err: err },
        { clientIp: req.ip },
        "Error in postReCAPTCHA"
      );
    }
  },
};
