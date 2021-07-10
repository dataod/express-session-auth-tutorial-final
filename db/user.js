const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    emailVerified: Boolean,
    emailVerificationToken: String,

    passwordResetToken: String,
    passwordResetExpires: Date,

    googleId: String,
    tokens: Array,

    shippingInfo: {
      first_name: String,
      middle_name: String,
      last_name: String,
      country: String,
      region: String,
      city: String,
      address_line_1: String,
      address_line_2: String,
      postal_code: String,
    },
    feedbackAvailable: Boolean,
  },
  { timestamps: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(
  candidatePassword,
  cb
) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

module.exports = mongoose.model("User", userSchema);
