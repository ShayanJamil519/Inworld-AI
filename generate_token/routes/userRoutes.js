const express = require("express");
const {getPackageOfUser , LimitRequest} = require("../controller/userController");
const router = express.Router();
var authenticated = require('../middleware/authenticated');


router.route("/limit").get(authenticated,LimitRequest);

module.exports = router;
