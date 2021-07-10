const router = require("express").Router();
const feedbackController = require("../controllers/feedbackController");

router.get("/get-feedback", feedbackController.getFeedback);
router.get("/rating-info", feedbackController.getRatingInfo);
router.post("/post-feedback", feedbackController.postFeedback);

module.exports = router;
