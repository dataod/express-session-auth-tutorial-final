const { createLogger } = require("bunyan");
// Prettifying bunyan dev console logs
const bunyanDebugStream = require("bunyan-debug-stream");

function buildDevLogger() {
  return createLogger({
    name: "express-dev-logger",
    streams: [
      {
        level: "info",
        stream: bunyanDebugStream({
          basepath: "N:\\JS\\YT\\authentication\\express-sessions-auth", // this should be the root folder of your project.
          forceColor: true,
        }),
      },

      {
        level: "error",
        path: "./logs/dev-error.log",
      },
    ],
    serializers: bunyanDebugStream.serializers,
    src: true, // Slow for production
  });
}
module.exports = buildDevLogger;
