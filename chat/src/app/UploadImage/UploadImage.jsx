import axios from "axios";
import React, { useState } from "react";

const UploadImage = () => {
  const [images, setImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);

  //   const updateProfileSubmit = (e) => {
  //     e.preventDefault();

  //     const myForm = new FormData();

  //     myForm.set("name", name);
  //     myForm.set("email", email);
  //     myForm.set("avatar", avatar);
  //     dispatch(updateProfile(myForm));
  //   };

  const handleSubmit = async () => {
    console.log("hello");
    const myForm = new FormData();

    images.forEach((images) => {
      myForm.append("images", images);
    });

    console.log("images: ", images);
    console.log("images: ", myForm);

    const config = {
      headers: { "Content-Type": "application/json" },
    };

    const upload = await axios
      .post("http://localhost:4000/api/img/create", myForm, config)
      .then((res) => console.log(res))
      .catch((err) => console.log(err.message));

    // const { data } = await axios.post(
    //   `http://localhost:4000/api/img/create`,
    //   myForm,
    //   config
    // );
  };

  const createProductImagesChange = (e) => {
    const files = Array.from(e.target.files);

    setImages([]);
    setImagesPreview([]);

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagesPreview((old) => [...old, reader.result]);
          setImages((old) => [...old, reader.result]);
        }
      };

      reader.readAsDataURL(file);
    });
    // console.log("images: ", images);
  };

  return (
    <>
      <div id="createProductFormFile">
        <input
          type="file"
          name="avatar"
          accept="image/*"
          onChange={createProductImagesChange}
          multiple
        />
      </div>

      <div id="createProductFormImage">
        {imagesPreview.map((image, index) => (
          <img key={index} src={image} alt="Product Preview" />
        ))}
      </div>

      <button onClick={handleSubmit}>Submit</button>
    </>
  );
};

export default UploadImage;
