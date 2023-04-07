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
    console.log("images" +images)
    console.log("images red" +req.body.images)   
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


  exports.getimmgs = catchAsyncErrors(async (req, res, next) => {
    const imgs = await Img.find()
    res.status(200).json({
      sucess: true,
      imgs,
    });
  });
  