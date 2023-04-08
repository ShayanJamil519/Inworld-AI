const mongoose = require("mongoose");

const imgSchema = mongoose.Schema({
  name: {
    type: String,
    default: "image",
    required: false,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
});
module.exports = mongoose.model("Img", imgSchema);
