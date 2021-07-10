const router = require("express").Router();
const passport = require("passport");
const authController = require("../controllers/authController");

require("dotenv").config();
const BASE_URL = process.env.BASE_URL;
const FAILURE_OAUTH_LOGIN = `${BASE_URL}/auth`;
const SUCCESS_OAUTH_LOGIN = `${BASE_URL}`;

// Local Strategy
router.post("/register", authController.Register);
router.post("/login", authController.Login);
router.get("/logout", authController.Logout);
router.get("/user", authController.getUser);

// Thrid party strategy endpoints
// Google
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google-callback",
  passport.authenticate("google", {
    failureRedirect: FAILURE_OAUTH_LOGIN,
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect(SUCCESS_OAUTH_LOGIN);
  }
);

module.exports = router;
