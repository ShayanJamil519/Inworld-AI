import React from "react";
import "./Payment.css";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const navigate = useNavigate();

  function handleClick(priceId: string) {
    navigate(`/payment/checkout/${priceId}`);
  }
  return (
    <div className="payment__container">
      <h1>LISTING PACKAGES</h1>
      <h4>PLEASE SELECT A LISTING PACKAGE</h4>
      <div className="payment__card__container">
        <div className="payment__card">
          <h2>Free</h2>
          <h1>Free</h1>
          <div className="plan">
            <h3>API Rate Limit:</h3>
            <h2>10</h2>
          </div>
          <button>Choose</button>
        </div>
        <div className="payment__card">
          <h2>STANDARD</h2>
          <h1>$5</h1>
          <div className="plan">
            <h3>API Rate Limit:</h3>
            <h2>20</h2>
          </div>
          <button onClick={() => handleClick("price_1MtId7H5DTXndbM5S6011iYS")}>
            Choose
          </button>
        </div>
        <div className="payment__card">
          <h2>Premium</h2>
          <h1>$10</h1>
          <div className="plan">
            <h3>API Rate Limit:</h3>
            <h2>30</h2>
          </div>
          <button onClick={() => handleClick("price_1MtId7H5DTXndbM57B16ve7p")}>
            Choose
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
