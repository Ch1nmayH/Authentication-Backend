const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { transporter } = require("../controllers/nodemailerConnect");

const handleError = (error) => {
  let errors = [];
  if (error.message.includes("user validation failed")) {
    Object.values(error.errors).forEach((property) => {
      errors.push(property.properties.message);
    });
  }

  return errors[0];
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

module.exports.all_users = (req, res, next) => {
  User.find({ verified: true }, (error, user) => {
    user.map((user) => {
      user.password = user.verified = user.__v = undefined;
    });

    console.log("aftter the middleware");
    return res.send(user);
  });
};

module.exports.signup_post = async (req, res, next) => {
  let { name, email, password } = req.body;
  try {
    let exist = await User.findOne({ email });

    if (exist) {
      return res.status(406).send("Email already exists");
    }

    let user = await User.create({
      name,
      email,
      password,
    });
    // handleVerification(user, res);
    return res.send({
      message: "successfully Created the account",
      user,
      // verification: "Verification email has been sent to your email id",
    });
    next();
  } catch (error) {
    let errorMessage = handleError(error);

    return res.status(406).send(errorMessage);
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
    let user = await User.login(email, password, res);
    // console.log(user);

    if (user) {
      if (!user.verified) {
        handleVerification(user, res);
        return res
          .status(406)
          .send("Verification email has been sent to your email id");
      }

      let userToken = await jwt.sign(
        { id: user._id, email: user.email },
        process.env.SECRET,
        { expiresIn: "15m" }
      );
      user.password = undefined;
      return res
        .status(201)
        .cookie("token", userToken, {
          maxAge: 1000 * 60 * 60 * 60 * 24,
          httpOnly: true,
          secure: false,
        })
        .send({
          message: "Successfully Logged in",
          user,
          token: userToken,
        });
    }

    next();
  } catch (error) {
    res.status(406).send(error.message);
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

module.exports.logUserOut = async (req, res, next) => {
  // return res.send("O");

  try {
    let token = req.cookies.token;
    console.log(token);
    let decodeToken = await jwt.verify(token, process.env.SECRET);
    console.log(decodeToken);
    let user = await User.findById(decodeToken.id);
    if (!user) {
      return res.status(406).send("You are not logged in");
    }

    res
      .status(201)
      .cookie("token", "", { maxAge: 1 })
      .send("Successfully Logged out");
    next();
  } catch (error) {
    return res.status(406).send("Invalid Cookie");
  }
};
