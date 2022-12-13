const nodemailer = require("nodemailer");
require("dotenv").config();

module.exports.transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

// const startNodeMailer = transporter.verify((error, result) => {
//   let a = 100;
//   if (error) {
//     console.log(error);
//   }

//   if (result) {
//     console.log("ready to send message");
//     console.log(result);
//   }
// });

// module.exports = startNodeMailer;
