const express = require("express");
const {
  createImg,
  getimmgs,
  updateImg,
  getAllImg,
} = require("../controller/imgController");
const router = express.Router();

router.route("/all").get(getAllImg);

router.route("/create").post(createImg);
router.route("/update").put(updateImg);

module.exports = router;
