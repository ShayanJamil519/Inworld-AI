const express = require("express");
const {
  getPackageOfUser,
  LimitRequest,
  updateUserPackage,
} = require("../controller/userController");
const router = express.Router();
var authenticated = require("../middleware/authenticated");

router.route("/limit").get(authenticated, LimitRequest);
// router.route("/update/:email").put(authenticated, updateUserPackage);
router.route("/update/:email").put(updateUserPackage);

module.exports = router;
