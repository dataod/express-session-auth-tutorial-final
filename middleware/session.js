const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");

require("dotenv").config();

// In production switching to https secure mode
let secureBool;
if (process.env.NODE_ENV === "development") {
  secureBool = false;
} else {
  secureBool = true;
}

module.exports = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: process.env.SESSION_NAME,
  store: MongoStore.create({
    mongooseConnection: mongoose.connection,
    mongoUrl: process.env.MONGODB_URI,
    autoReconnect: true,
    collectionName: "sessions",
    ttl: 60 * 60 * 2, // mongo uses seconds so either devide by 1000 or not multi
  }),
  cookie: {
    sameSite: true,
    secure: secureBool, // set to true in production https
    httpOnly: true, // if true: prevents client side JS from reading cookie
    maxAge: 1000 * 60 * 60 * 2, // Equals 2 hours (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
  },
});
