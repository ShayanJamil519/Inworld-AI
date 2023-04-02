// import express from "express";
// import { getPublishableKey } from "../controller/paymentController";

const express = require("express");
const {
  getPublishableKey,
  createPaymentIntent,
} = require("../controller/paymentController");

const router = express.Router();

router.route("/config").get(getPublishableKey);
router.route("/create-payment-intent").post(createPaymentIntent);

module.exports = router;
