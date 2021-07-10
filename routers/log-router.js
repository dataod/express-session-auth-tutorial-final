const router = require("express").Router();
const logController = require("../controllers/logController");

router.put("/client-logs", logController.putClientLogs);

module.exports = router;
