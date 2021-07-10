const logger = require("../logger");
const clientLogger = require("../logger/client-logger");

module.exports = {
  /**
   *  PUT /client-logs
   *  processing the server stream of client logs
   */
  async putClientLogs(req, res, next) {
    try {
      if (req.body[0].levelName === "error") {
        clientLogger.error(req.body, { clientIp: req.ip });
      } else {
        clientLogger.info(req.body, { clientIp: req.ip });
      }
    } catch (err) {
      logger.error(
        { err: err },
        { meta: "Client-logger" },
        { clientIp: req.ip },
        "Error in putClientLogs"
      );
    }
  },
};
