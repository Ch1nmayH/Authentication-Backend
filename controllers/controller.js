const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { transporter } = require("../controllers/nodemailerConnect");

const handleError = (error) => {
  let errors = {};
  if (error.message.includes("user validation failed")) {
    Object.values(error.errors).forEach((property) => {
      errors[property.properties.path] = property.properties.message;
    });
  }

  return errors;
};

const handleVerification = async ({ _id, email }, res) => {
  transporter.verify((error, result) => {
    let a = 100;
    if (error) {
      console.log(error);
    }

    if (result) {
      console.log("ready to send message");
      console.log(result);
    }
  });

  let currentUrl = process.env.CURRENTURL;

  let idToken = await jwt.sign({ id: _id.toString() }, process.env.SECRET, {
    expiresIn: 60 * 60,
  });

  let verifyUrl = currentUrl + "/" + idToken;
  let mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Email Verification",
    html: `<p>Click on this <a href='http://localhost:8000/api/verify/${idToken}'> link </a> to verify your email </p>`,
  };
  transporter
    .sendMail(mailOptions)
    .then(() => {
      console.log("email sent");
    })
    .catch((e) => {
      console.log(e.message);
    });

  // return verifyUrl;
};

module.exports.signup_post = async (req, res, next) => {
  let { name, email, password } = req.body;
  try {
    let exist = await User.findOne({ email });

    if (exist) {
      console.log(process.env.CURRENTURL);
      return res.status(406).send("Email already exists");
    }

    let hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    let user = await User.create({ name, email, password: hashedPassword });
    handleVerification(user, res);
    // let verifyUrl = await handleVerification(user, res);
    // console.log(verifyUrl);
    // res.send(verifyUrl);
    // res.status(201).send(user);
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
        if (user.verified) {
          return res.send(`${user.name}, you have successfully LoggedIn`);
        } else {
          return res.send(`${user.name}, you need to verify your email`);
        }
      }

      return res.send("Wrong Password");
    }
    return res.send("Wrong Email id");

    // res.status(201).send("Login here");
    next();
  } catch (error) {
    res.send(error.message);
    next();
  }
};
