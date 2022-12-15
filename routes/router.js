const router = require("express").Router();
const controller = require("../controllers/controller");

router.post("/signup", controller.signup_post);
router.post("/login", controller.login_post);

//This will let you enter your email id and the password reset link will be sent to your email id
router.post("/forgotPassword", controller.forgotPassword_post);

//This is the link where you enter a password and a confirm password and click on reset password button
router.get("/forgotPassword/:id", controller.newPassword);

//here your entered password is hashed and updated in the database
router.post("/resetPassword/:id", controller.resetPassword);

module.exports = router;
