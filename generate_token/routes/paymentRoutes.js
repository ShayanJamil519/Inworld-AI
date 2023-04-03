
const express = require("express");
const {
  getPublishableKey,
  createPaymentIntent,
} = require("../controller/paymentController");

const {
  getPackageOfUser
} = require("../controller/userController");


const router = express.Router();

router.route("/config").get(getPublishableKey);
router.route("/create-payment-intent").post(createPaymentIntent);
router.route("/package").get(getPackageOfUser);

module.exports = router;
