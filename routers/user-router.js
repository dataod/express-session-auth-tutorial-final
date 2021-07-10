const router = require("express").Router();
const userController = require("../controllers/userController");

router.post("/account/password", userController.postChangePassword);
router.post("/account/information", userController.postShippingInfo);
router.post("/password-reset/request", userController.postResetRequest);
router.post("/recaptcha-verify", userController.postReCAPTCHA);

module.exports = router;
