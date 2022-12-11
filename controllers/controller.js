const User = require("../model/user");
const bcrypt = require("bcrypt");

const handleError = (error) => {
  let errors = {};
  if (error.message.includes("user validation failed")) {
    Object.values(error.errors).forEach((property) => {
      errors[property.properties.path] = property.properties.message;
    });
  }

  return errors;
};

module.exports.signup_post = async (req, res, next) => {
  let { name, email, password } = req.body;
  try {
    let exist = await User.findOne({ email });

    if (exist) {
      return res.status(406).send("Email already exists");
    }

    let hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    let user = await User.create({ name, email, password: hashedPassword });
    res.status(201).send(user);
    next();
  } catch (error) {
    let errorMessage = handleError(error);
    console.log(errorMessage);
    res.status(406).send(errorMessage);
    next();
  }
};
module.exports.login_post = async (req, res, next) => {
  let { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      let comparePassword = await bcrypt.compare(password, user.password);
      if (comparePassword) {
        // res.redirect("/");
        return res.send(`${user.name}, you have successfully LoggedIn`);
      }
      return res.send("Wrong Password");
    }
    return res.send("Wrong Email id");

    res.status(201).send("Login here");
    next();
  } catch (error) {
    res.send(error.message);
    next();
  }
};
