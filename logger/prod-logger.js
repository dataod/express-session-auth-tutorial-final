const { createLogger, stdSerializers } = require("bunyan");

function buildProdLogger() {
  return createLogger({
    name: "express-prod-logger",
    streams: [
      {
        level: "info",
        path: "./logs/prod-info.log",
        type: "rotating-file",
        period: "1d", // daily rotation
        count: 7, // keep 7 back copies
      },

      {
        level: "error",
        path: "./logs/prod-error.log",
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
