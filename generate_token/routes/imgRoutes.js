const express = require("express");
const { createImg, getimmgs } = require("../controller/imgController");
const router = express.Router();

router.route("/").get(getimmgs);
router.route("/create").post(createImg);

module.exports = router;