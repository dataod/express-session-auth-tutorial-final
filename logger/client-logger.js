const { createLogger, stdSerializers } = require("bunyan");

const clientLogger = createLogger({
  name: "express-client-logger",
  streams: [
    {
      level: "info",
      path: "./logs/client-info.log",
      type: "rotating-file",
      period: "1d", // daily rotation
      count: 7, // keep 7 back copies
    },

    {
      level: "error",
      path: "./logs/client-error.log",
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

module.exports = clientLogger;
