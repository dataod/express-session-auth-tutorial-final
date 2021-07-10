const router = require("express").Router();
const emailController = require("../controllers/emailController");

router.post("/email-verification", emailController.postVerification);
router.post("/forgot-pw", emailController.postForgotPassword);
router.post("/password-reset", emailController.postPasswordReset);

module.exports = router;
