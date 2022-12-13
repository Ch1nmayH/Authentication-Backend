const jwt = require("jsonwebtoken");
const user = require("../model/user");
const verifyEmail = require("express").Router();

verifyEmail.get("/:id", async (req, res) => {
  try {
    let token = req.params;

    let decode = await jwt.verify(token.id, process.env.SECRET);

    const User = await user.findById(decode.id);
    if (User) {
      if (User.verified) {
        return res.send(
          `Hello ${User.name} your account has already been verified`
        );
      }

      updateUser = await user.updateOne({ _id: decode.id }, { verified: true });
      return res.send(`Hello ${User.name} your account is now verified`);
    } else {
      return res.send(`Invalid Link`);
    }
  } catch (error) {
    console.log(error);
    return res.send(`Invalid Link`);
  }
});

module.exports = verifyEmail;
