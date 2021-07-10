const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    project_name: String,
    text: String,
    postedAt: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
