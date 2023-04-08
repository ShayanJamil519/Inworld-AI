const express = require("express");
const {
  createSubscription,
  getPublishableKey,
  cancelSubscription,
  getNames
  
} = require("../controller/paymentController");

const { getPackageOfUser } = require("../controller/userController");

const router = express.Router();

router.route("/create-subscription").post(createSubscription);
router.route("/get-publishableKey").get(getPublishableKey);
router.route("/package/:email").get(getPackageOfUser);
router.route("/names").get(getNames);
router.route("/delete").delete(cancelSubscription);

module.exports = router;
