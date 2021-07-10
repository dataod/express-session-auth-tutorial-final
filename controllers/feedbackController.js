const logger = require("../logger");
const Feedback = require("../db/feedback");
const Project = require("../db/project");
const User = require("../db/user");
const helpers = require("../utils/helpers");
const moment = require("moment");
const feedbackSchema = require("../validations/feedbackSchema");

module.exports = {
  /**
   *  GET /get-feedback
   *  Get all Users feedback
   */
  async getFeedback(req, res, next) {
    try {
      await Feedback.find({}, (err, feedback) => {
        if (err) {
          logger.error({ err: err }, { clientIp: req.ip }, "Feedback error.");
          return next(err);
        }

        if (!feedback) {
          return res.status(400).send({ msg: "No feedback." });
        } else {
          res.status(200).send(feedback);
        }
      });
    } catch (err) {
      logger.error({ err: err }, { clientIp: req.ip }, "Feedback error.");
    }
  },

  /**
   *    GET /rating-info
   *    Get projects rating info
   */
  async getRatingInfo(req, res, next) {
    try {
      // Finding and sending all project since there is only one
      // In a proper implementation Find only specified one
      await Project.find({}, (err, project) => {
        if (err) {
          logger.error(
            { err: err },
            { clientIp: req.ip },
            "Rating info error."
          );
          return next(err);
        }
        if (!project) {
          return res.status(400).send({ msg: "No projects." });
        } else {
          res.status(200).send(project);
        }
      });
    } catch (err) {
      logger.error({ err: err }, { clientIp: req.ip }, "Rating info error.");
    }
  },

  /**
   *    POST /post-feedback
   *    POST feedback ,update project ratings and update users previlige
   */
  async postFeedback(req, res, next) {
    try {
      // Validation
      await feedbackSchema.validateAsync({
        text: req.body.text,
        rating: req.body.rating,
      });
      //
      await User.findById(req.user.id, (err, user) => {
        if (err) {
          logger.error(
            { err: err },
            { clientIp: req.ip },
            "POST feedback error."
          );
          return next(err);
        }
        // If user have not submitted feedback yet and verified account
        if (user.feedbackAvailable && user.emailVerified) {
          const newFeedback = new Feedback();
          newFeedback.username = req.body.username;
          newFeedback.project_name = req.body.project_name;
          newFeedback.rating = req.body.rating;
          newFeedback.text = req.body.text;

          newFeedback.postedAt = moment().format("MMMM Do YYYY");

          newFeedback.save((err) => {
            if (err) {
              logger.error(
                { err: err },
                { clientIp: req.ip },
                "New feedback save error."
              );
              return next(err);
            }

            res.status(201).send({ msg: "Feedback successfully submitted." });
          });

          // Adding new rating to project and calculating new values.
          Project.findOne(
            { project_name: req.body.project_name },
            (err, project) => {
              if (err) {
                logger.error(
                  { err: err },
                  { clientIp: req.ip },
                  "Project error."
                );
                return next(err);
              }
              if (!project) {
                logger.error(
                  { err: err },
                  { clientIp: req.ip },
                  "Project with this name doesn't exist."
                );
                return res
                  .status(400)
                  .send({ msg: "Project with this name doesn't exist." });
              }

              project.ratings.totalRatingsCount =
                project.ratings.totalRatingsCount + 1;

              if (req.body.rating === 5) {
                project.ratings.fiveStarsCount =
                  project.ratings.fiveStarsCount + 1;
              } else if (req.body.rating === 4) {
                project.ratings.fourStarsCount =
                  project.ratings.fourStarsCount + 1;
              } else if (req.body.rating === 3) {
                project.ratings.threeStarsCount =
                  project.ratings.threeStarsCount + 1;
              } else if (req.body.rating === 2) {
                project.ratings.twoStarsCount =
                  project.ratings.twoStarsCount + 1;
              } else {
                project.ratings.oneStarsCount =
                  project.ratings.oneStarsCount + 1;
              }

              project.ratings.averageStars = helpers.formatRound(
                (5 * project.ratings.fiveStarsCount +
                  4 * project.ratings.fourStarsCount +
                  3 * project.ratings.threeStarsCount +
                  2 * project.ratings.twoStarsCount +
                  1 * project.ratings.oneStarsCount) /
                  project.ratings.totalRatingsCount,
                1
              );

              project.save((err) => {
                if (err) {
                  logger.error(
                    { err: err },
                    { clientIp: req.ip },
                    "Project save error."
                  );
                  return next(err);
                }
              });
            }
          );

          user.feedbackAvailable = false;
          user.save((err) => {
            if (err) {
              logger.error(
                { err: err },
                { clientIp: req.ip },
                "User save error."
              );
              return next(err);
            }

            const sessionUser = helpers.sessionizeUser(user);
            req.session.user = sessionUser;
          });
        } else if (user.feedbackAvailable && !user.emailVerified) {
          // If feedback is available, but email was not verified
          res.status(400).send({
            msg: "You need to verify your email before you can leave a feedback.",
          });
        } else {
          // If user already left feedback
          res.status(400).send({ msg: "You already submitted feedback." });
        }
      });
    } catch (err) {
      logger.error({ err: err }, { clientIp: req.ip }, "POST feedback error.");
    }
  },
};
