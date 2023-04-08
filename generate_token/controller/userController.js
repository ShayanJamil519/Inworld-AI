const User = require("../model/userModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorhandler");

getPackageOfUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    const package = user?.package;
    res.status(200).json({
      sucess: true,
      package,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

LimitRequest = async (req, res) => {
  try {
    console.log("api called");
    res.status(200).json({
      message: "nice",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

// update user package
updateUserPackage = async (req, res) => {
  const updateUser = await User.findOneAndUpdate(
    { email: req.params.email },
    req.body,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
  res.status(200).json({
    success: true,
    updateUser,
  });
};

// update user package
getUserDetail = async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user) {
    res.status(404).json({
      message: "user not found with this email",
    });
  } else {
    res.status(200).json({
      user,
    });
  }
};

module.exports = {
  getPackageOfUser,
  LimitRequest,
  updateUserPackage,
  getUserDetail,
};

// mraza6601@gmail.com
