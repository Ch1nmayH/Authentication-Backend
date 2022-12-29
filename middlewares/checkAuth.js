const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../model/user");

module.exports.checkAuth = async (req, res, next) => {
  try {
    let token = req.cookies.token;
    let decodeToken = await jwt.verify(token, process.env.SECRET);
    let user = await User.findById(decodeToken.id);
    if (!user) {
      return res.status(401).send("You are not authorised to view this page");
    }

    next();
  } catch (error) {
    res.status(401).send("You are not authenticated");
  }
};
