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
};

const resetPassword = async ({ _id, email }, res) => {
  transporter.verify((error, result) => {
    if (error) {
      console.log(error);
    }

    if (result) {
      console.log("ready to send message");
      console.log(result);
    }
  });

  let resetToken = await jwt.sign({ id: _id.toString() }, process.env.SECRET, {
    expiresIn: 60 * 60,
  });
  let recipient = email;
  console.log(recipient);

  let resetMailOption = {
    from: process.env.AUTH_EMAIL,
    to: recipient,
    subject: "Reset your Password ?",
    html: `<p>Click on this <a href = 'http://localhost:8000/api/forgotPassword/${resetToken}'> Link </a> to reset your password</p>`,
  };
  transporter
    .sendMail(resetMailOption)
    .then(() => {
      console.log("Reset Mail Has been sent");
    })
    .catch((e) => {
      console.log(e.message);
    });
};

module.exports.signup_post = async (req, res, next) => {
  let { name, email, password } = req.body;
  try {
    let exist = await User.findOne({ email });

    if (exist) {
      return res.status(406).send("Email already exists");
    }

    if (!password)
      throw Error(res.status(406).send("Please input all the fields"));
    let hashedPassword = await bcrypt.hash(password, 10);
    let user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    handleVerification(user, res);
    res.send({
      message: "successfully Created the account",
      verification: "Verification email has been sent to your email id",
    });
    next();
  } catch (error) {
    let errorMessage = handleError(error);

    return res.send(errorMessage);
  }

  next();
};
module.exports.login_post = async (req, res, next) => {
  let { email, password } = req.body;

  if (!email) {
    return res.status(406).send("Please enter the email id");
  }
  if (!password) {
    return res.status(406).send("Please enter the Password");
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      let comparePassword = await bcrypt.compare(password, user.password);
      if (comparePassword) {
        if (user.verified) {
          let userToken = await jwt.sign(
            { id: user._id, email: user.email },
            process.env.SECRET,
            { expiresIn: "15m" }
          );
          // res.status(201).cookie("token", userToken, { httpOnly: true });
          user.password = undefined;
          return res.status(201).cookie("token", userToken).send({
            message: "Successfully Logged in",
            token: userToken,
          });
        } else {
          handleVerification(user, res);
          return res.send({
            message: "Verification email has been sent to your email id",
          });
        }
      }

      return res.status(406).send("Invalid Password");
    }
    return res.status(406).send("Invalid Email id");

    next();
  } catch (error) {
    res.send(error.message);
    next();
  }
};

module.exports.forgotPassword_post = async (req, res, next) => {
  let email = req.body.email;
  user = await User.findOne({ email });

  if (user) {
    resetPassword(user, res);
    next();
  } else {
    return res.send("Invalid Email Id");
    next();
  }
};

module.exports.newPassword = async (req, res, next) => {
  try {
    let token = req.params;
    let decode = jwt.verify(token.id, process.env.SECRET);

    if (decode) {
      res.send(`http://localhost:8000/api/resetPassword/${token.id}`);
    } else {
      return res.send("Invalid Link");
    }
  } catch (error) {
    console.log(error.message);
    return res.send("Invalid Link");
  }
};

module.exports.resetPassword = async (req, res, next) => {
  try {
    let decode = await jwt.verify(req.params.id, process.env.SECRET);
    let { password, confirmPassword } = req.body;
    if (decode) {
      if (password === confirmPassword) {
        let hashPassword = await bcrypt.hash(password, 11);
        let user = await User.updateOne(
          { _id: decode.id },
          { password: hashPassword }
        );
        res.send("Password Has been updated");
      } else {
        res.send("Passwords donot match");
      }
    }
  } catch (error) {
    res.send(error.message);
  }
};
