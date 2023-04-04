const User = require('../model/userModel')
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorhandler");




getPackageOfUser = async (req, res) => {
    try {
        const user = await User.findOne({email:req.params.email })
        const package = user?.package;
        res.status(200).json({
            sucess: true,
            package
        })
    } catch (error) {
      console.log(error);
      res.status(400).json({ error });
    }
  };

LimitRequest = async (req, res) => {
    try {
      console.log("api called")
        res.status(200).json({
            message: "nice"
        })
    } catch (error) {
      console.log(error);
      res.status(400).json({ error });
    }
  };

  module.exports = {
    getPackageOfUser,
    LimitRequest
  };
  