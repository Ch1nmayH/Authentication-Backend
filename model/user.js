const mongoose = require("mongoose");
const isEmail = require("validator/lib/isEmail");

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Please enter your name"] },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    min: 6,
    required: [true, "Please Enter the password"],
  },
  verified: { type: Boolean, default: false },
});

module.exports = mongoose.model("user", userSchema);
