const { createLogger, stdSerializers } = require("bunyan");

const fs = require("fs");
const path = require("path");
const logs = "logs"; // directory path you want to set
if (!fs.existsSync(logs)) {
  // Create the directory if it does not exist
  fs.mkdirSync(logs);
}

function buildProdLogger() {
  return createLogger({
    name: "express-prod-logger",
    streams: [
      {
        level: "info",
        path: path.join(logs, "prod-info.log"),
        type: "rotating-file",
        period: "1d", // daily rotation
        count: 7, // keep 7 back copies
      },

      {
        level: "error",
        path: path.join(logs, "prod-error.log"),
        type: "rotating-file",
        period: "1d", // daily rotation
        count: 7, // keep 7 back copies
      },
    ],
    serializers: {
      err: stdSerializers.err,
      req: stdSerializers.req,
      res: stdSerializers.res,
    },
  });
}
module.exports = buildProdLogger;
