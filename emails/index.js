const logger = require("../logger");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);

require("dotenv").config();

const BASE_URL = process.env.BASE_URL;

let MAIL_BASE_DOMAIN;
if (process.env.NODE_ENV === "development") {
  MAIL_BASE_DOMAIN = process.env.MAILGUN_SANDBOX_BASE_DOMAIN; // using sandbox in development
} else {
  MAIL_BASE_DOMAIN = process.env.MAILGUN_BASE_DOMAIN;
}

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
  url: "https://api.mailgun.net",
});

const sendVerification = (email, token) => {
  mg.messages
    .create(MAIL_BASE_DOMAIN, {
      from: "Dataod <no-reply@dataod.com>",
      to: email,
      subject: "Email Verification",
      template: "email_verification",
      "v:BASE_URL": `${BASE_URL}`,
      "v:token": `${token}`,
    })
    .then((msg) => {
      logger.info(msg);
    })
    .catch((err) => logger.error(err));
};

const sendPasswordReset = (email, token) => {
  mg.messages
    .create(MAIL_BASE_DOMAIN, {
      from: "Dataod <no-reply@dataod.com>",
      to: email,
      subject: "Password reset",
      template: "tutorial_password_reset",
      "v:BASE_URL": `${BASE_URL}`,
      "v:token": `${token}`,
    })
    .then((msg) => {
      logger.info(msg);
    })
    .catch((err) => logger.error(err));
};

const sendPWChangeConfirmation = (email) => {
  mg.messages
    .create(MAIL_BASE_DOMAIN, {
      from: "Dataod <no-reply@dataod.com>",
      to: email,
      subject: "Your Password has been changed",
      template: "tutorial_password_change_confirmation",
      "v:email": `${email}`,
    })
    .then((msg) => {
      logger.info(msg);
    })
    .catch((err) => logger.error(err));
};

module.exports = {
  sendVerification,
  sendPasswordReset,
  sendPWChangeConfirmation,
};
