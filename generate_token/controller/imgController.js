const Img = require("../model/imgModel");
const cloudinary = require("cloudinary");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/errorhandler");

exports.createImg = catchAsyncErrors(async (req, res, next) => {
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "imgs",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;

  const img = await Img.create(req.body);

  res.status(201).json({
    success: true,
    img,
  });
});

exports.updateImg = catchAsyncErrors(async (req, res, next) => {
  let image = await Img.findOne({ name: "image" });
  if (!image) {
    res
      .status(404)
      .json({ success: false, message: "could not found any image" });
  }
  // Images Start Here
  let images = [];

  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < image.images.length; i++) {
      await cloudinary.v2.uploader.destroy(image.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "imgs",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

  image = await Img.findOneAndUpdate({ name: "image" }, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    image,
  });
});

// Get All Img (Admin)
exports.getAllImg = catchAsyncErrors(async (req, res, next) => {
  const images = await Img.find();

  res.status(200).json({
    success: true,
    images,
  });
});
