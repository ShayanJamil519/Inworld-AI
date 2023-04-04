import React from "react";
import "./Home.css";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { BsTwitter } from "react-icons/bs";
import { Link } from "react-router-dom";
const Home = () => {
  return (
    <div className="home__container">
      <h1>Welcome to InworldAi</h1>
      <p>Chat With your Favourite Characters</p>
      <div className="buttons__container">
        <Link to="http://localhost:4000/auth/google">
        <button className="socials__login" >
          {" "}
          <FcGoogle /> Continue with google
        </button>
        </Link>
        <button className="socials__login">
          {" "}
          <FaFacebookF style={{ color: "#3b5998" }} /> Continue with facebook
        </button>
        <button className="socials__login">
          {" "}
          <BsTwitter style={{ color: "#00acee" }} /> Continue with twitter
        </button>
      </div>
    </div>
  );
};

export default Home;
