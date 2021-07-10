const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    project_name: {
      type: String,
      required: true,
    },
    ratings: {
      totalStars: Number,
      averageStars: Number,
      oneStarsCount: Number,
      twoStarsCount: Number,
      threeStarsCount: Number,
      fourStarsCount: Number,
      fiveStarsCount: Number,
      totalRatingsCount: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
