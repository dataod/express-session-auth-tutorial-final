const User = require("../db/user");
const logger = require("../logger");
const helpers = require("../utils/helpers");
const authSchema = require("../validations/authSchema");
const passport = require("passport");
const emails = require("../emails");
const mailChecker = require("mailchecker");

const { promisify } = require("util");
const crypto = require("crypto");
const randomBytesAsync = promisify(crypto.randomBytes);

module.exports = {
  /**
   * POST /register
   * Create a new local strategy account.
   */
  async Register(req, res, next) {
    // Validation
    try {
      // Checking if the email is blacklisted spambox
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
      // Validating request
      await authSchema.validateAsync({
        email: req.body.email,
        password: req.body.password,
      });
      //https://stackoverflow.com/questions/18371339/how-to-retrieve-name-from-email-address/18371753
      // Making username out of 1st part of the email
      const username = req.body.email.substring(
        0,
        req.body.email.lastIndexOf("@")
      );

      // New user creation
      const newUser = await new User();
      newUser.username = username;
      newUser.email = req.body.email;
      newUser.password = req.body.password;
      newUser.emailVerified = false;
      newUser.shippingInfo.first_name = "";
      newUser.shippingInfo.middle_name = "";
      newUser.shippingInfo.last_name = "";
      newUser.shippingInfo.country = "";
      newUser.shippingInfo.region = "";
      newUser.shippingInfo.city = "";
      newUser.shippingInfo.address_line_1 = "";
      newUser.shippingInfo.address_line_2 = "";
      newUser.shippingInfo.postal_code = "";

      newUser.feedbackAvailable = true;

      const sessionUser = helpers.sessionizeUser(newUser);
      req.session.user = sessionUser;

      await User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (err) {
          logger.error({ err: err }, "Error finding user.");
          return next(err);
        }
        if (existingUser) {
          logger.info(
            { existingUser: existingUser },
            "User with this email already registered.",
            { clientIp: req.ip }
          );
          return res
            .status(400)
            .send("User with this email already registered.");
        }
        newUser.save((err) => {
          if (err) {
            return next(err);
          }
          req.logIn(newUser, (err) => {
            if (err) {
              logger.error({ err: err }, "Error saving user.");
              return next(err);
            }
            // Create verification token and send email

            const createRandomToken = randomBytesAsync(16).then((buf) =>
              buf.toString("hex")
            );

            const setRandomToken = (token) => {
              User.findOne({ email: req.body.email }).then((user) => {
                user.emailVerificationToken = token;
                user = user.save();
              });
              return token;
            };

            const sendEmail = (token) => {
              emails.sendVerification(req.body.email, token);
            };

            createRandomToken.then(setRandomToken).then(sendEmail).catch(next);
            // end of email section
            res.send(sessionUser);
          });
        });
      });
    } catch (err) {
      logger.error({ err: err }, "Registration error.");
      res.status(401).send(err);
    }
  },

  /**
   * POST /login
   * Login using email and password.
   */

  async Login(req, res, next) {
    try {
      await authSchema.validateAsync({
        email: req.body.email,
        password: req.body.password,
      });

      await passport.authenticate("local", (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).send(info);
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }

          const sessionUser = helpers.sessionizeUser(user);
          req.session.user = sessionUser;
          res.send(sessionUser);
        });
      })(req, res, next);
    } catch (err) {
      logger.error({ err: err }, "Login Error.", { clientIp: req.ip });
      res.status(401).send(err);
    }
  },

  /**
   * GET /logout
   * Log out.
   */
  async Logout(req, res) {
    try {
      await req.logout();
      await req.session.destroy((err) => {
        if (err) {
          logger.error(
            { err: err },
            "Error : Failed to destroy the session during logout."
          );
        }
        req.user = null;
        res.send("Logout Success");
      });
    } catch (err) {
      logger.error({ err: err }, "Logout error.");
    }
  },

  /**
   *  GET User
   */

  async getUser(req, res, next) {
    try {
      if (req.user) {
        const sessionUser = helpers.sessionizeUser(req.user);
        req.session.user = sessionUser;

        // This update and save the data to the session
        await req.session.save(function (err) {
          if (err) {
            return next(err);
          }
          req.session.reload(function (err) {
            if (err) {
              return next(err);
            }
          });
        });

        await res.send({ sessionUser });
      } else {
        await res.send(req.session.user);
      }
    } catch (err) {
      logger.error({ err: err }, "getUser error.", { clientIp: req.ip });
    }
  },
};
