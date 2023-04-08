import axios from "axios";
import React, { useState } from "react";
import "./UploadImage.css";

const UploadImage = () => {
  const [image, setImage] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [customObject, updateCustomObject] = useState("customObjectTokenPay", {
    images: [],
  });

  const { images } = customObject;

  const createProductImagesChange = (e) => {
    const files = Array.from(e.target.files);

    setImage([]);
    setImagesPreview([]);

    const imageUrls = [];

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagesPreview((old) => [...old, reader.result]);
          setImage((old) => [...old, reader.result]);
          imageUrls.push(reader.result);
          updateCustomObject({ images: imageUrls });
        }
      };

      reader.readAsDataURL(file);
    });
  };

  // first time post request:
  // const handleSubmit = async () => {
  //   const { images } = customObject;
  //   // console.log(customObject.images[0]);

  //   let img = [];
  //   for (let i = 0; i < customObject.images.length; i++) {
  //     img.push(customObject.images[i]);
  //     console.log(`at level ${i}`, img);
  //   }

  //   console.log("img: ", img);
  //   console.log("asf");
  //   await axios
  //     .post("http://localhost:4000/api/img/create", {
  //       images,
  //     })
  //     .then((res) => {
  //       console.log(res);
  //       // toast.success("Token created successfully");
  //       // setTimeout(() => {
  //       //   window.location.reload(true);
  //       // }, "2000");
  //     })
  //     .catch((err) => console.log(err));
  // };

  // Then always put request
  const handleSubmit = async () => {
    await axios
      .put("http://localhost:4000/api/img/update", {
        images,
      })
      .then((res) => {
        console.log(res);
        // toast.success("Token created successfully");
        // setTimeout(() => {
        //   window.location.reload(true);
        // }, "2000");
      })
      .catch((err) => console.log(err));
  };

  return (
    // <div className="Upload__Image">
    //   <div id="createProductFormFile">
    //     <input
    //       type="file"
    //       name="avatar"
    //       accept="image/*"
    //       onChange={createProductImagesChange}
    //       multiple
    //     />
    //   </div>

    // <div id="createProductFormImage">
    //   {imagesPreview.map((image, index) => (
    //     <img key={index} src={image} alt="Product Preview" />
    //   ))}
    // </div>

    //   <button onClick={handleSubmit}>Submit</button>
    // </div>
    <div className="upload-container">
      <div className="upload-body">
        <label className="custom-file-token">
          <input
            type="file"
            accept="image/*"
            onChange={createProductImagesChange}
            name="image"
            multiple
          />
          Upload Images
        </label>
        <div id="createProductFormImage">
          {imagesPreview.map((image, index) => (
            <img key={index} src={image} alt="Product Preview" />
          ))}
        </div>
        <button onClick={handleSubmit} className="upload__button">
          Submit
        </button>
      </div>
    </div>
  );
};

export default UploadImage;
