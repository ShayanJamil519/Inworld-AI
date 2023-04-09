const express = require("express");
const {
  LimitRequest,
  updateUserPackage,
  getUserDetail,
} = require("../controller/userController");
const router = express.Router();
var authenticated = require("../middleware/authenticated");

router.route("/limit").get(authenticated, LimitRequest);
// router.route("/update/:email").put(authenticated, updateUserPackage);
//router.route("/update/:email").put(updateUserPackage);
//router.route("/get/:email").get(getUserDetail);

module.exports = router;
