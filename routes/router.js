const router = require("express").Router();
const controller = require("../controllers/controller");

router.post("/signup", controller.signup_post);
router.post("/login", controller.login_post);

module.exports = router;
