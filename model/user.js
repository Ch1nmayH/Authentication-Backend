const mongoose = require("mongoose");
const isEmail = require("validator/lib/isEmail");
const bcrypt = require("bcrypt");

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
    minLength: [6, "Password must be atleast 6 characters long"],
    required: [true, "Please Enter the password"],
  },
  verified: { type: Boolean, default: true },
  role: { type: String, default: "member" },
});

userSchema.pre("save", async function (next) {
  try {
    let salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);

    return next();
  } catch (error) {
    console.log(error);
    throw Error("Unable to create the user");
    next();
  }
});

userSchema.statics.login = async function (email, password) {
  let user = await this.findOne({ email });
  if (user) {
    let comparePassword = await bcrypt.compare(password, user.password);
    if (comparePassword) {
      return user;
    }
    throw Error("Invalid Password");
  }
  throw Error("Invalid Email Id");
};

module.exports = mongoose.model("user", userSchema);
