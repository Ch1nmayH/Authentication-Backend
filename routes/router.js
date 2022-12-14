const router = require("express").Router();
const controller = require("../controllers/controller");

router.post("/signup", controller.signup_post);
router.post("/login", controller.login_post);

router.post("/forgotPassword", controller.forgotPassword_post);
router.get("/forgotPassword/:id", controller.newPassword);

router.post("/resetPassword/:id", controller.resetPassword);

module.exports = router;
