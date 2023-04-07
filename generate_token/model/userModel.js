const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  googleId: String,
  name: String,
  email: {
    type: String,
    required: true,
  },
  package: {
    type: String,
    default: "0",
    required: false,
  },

  subscriptionId: {
    type: String,
    default: "",
    required: false,
  },

  //package 0: not paid , 1 = standard , 2 = preemium
});

module.exports = mongoose.model("User", UserSchema);
