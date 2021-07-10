const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const allowedOrigins = require("./cors/allowedOrigins");
const session = require("./middleware/session");
const passport = require("passport");
const logger = require("./logger");
// Routers
const authRouter = require("./routers/auth-router");
const userRouter = require("./routers/user-router");
const emailRouter = require("./routers/email-router");
const feedbackRouter = require("./routers/feedback-router");
const logRouter = require("./routers/log-router");

require("dotenv").config();

(async () => {
  try {
    /**
     * Connect to MongoDB.
     */
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");

    const app = express();
    app.use(helmet());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // if you run behind a proxy (e.g. nginx)
    //app.set("trust proxy", 1);
    app.use(
      cors({
        origin: function (origin, callback) {
          // allow requests with no origin
          // (like mobile apps or curl requests)
          // logger.info(origin);
          if (!origin) return callback(null, true);
          if (allowedOrigins.indexOf(origin) === -1) {
            var msg =
              "The CORS policy for this site does not " +
              "allow access from the specified Origin.";
            return callback(new Error(msg), false);
          }
          return callback(null, true);
        },
        credentials: true,
      })
    );

    // Session setup
    app.use(session);
    /**
     * -------------- PASSPORT AUTHENTICATION ----------------
     */
    app.use(passport.initialize());
    app.use(passport.session());
    require("./config/passport")(passport);
    // });
    /**
     * -------------- ROUTERS ----------------
     */
    app.use(logRouter);
    app.use(authRouter);
    app.use(userRouter);
    app.use(emailRouter);
    app.use(feedbackRouter);

    const PORT = process.env.PORT;
    app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
  } catch (err) {
    logger.error({ err: err }, "Server.js error.");
  }
})();
