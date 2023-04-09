import React, { useEffect, useState } from "react";
import "./Payment.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Payment = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [packageName, setPackageName] = useState("");

  function handleClick(priceId) {
    navigate(`/payment/checkout/${priceId}`);
  }

  function getData() {
    console.log("user: ", user);
  }

  const cancelSubscription = async () => {
    let data = JSON.stringify({
      subscriptionId: user.subscriptionId,
    });

    let config = {
      method: "delete",
      maxBodyLength: Infinity,
      url: "http://localhost:4000/payment/delete",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    axios
      .get(
        `http://localhost:4000/payment/package/get/muhammadabdullahimdad10@gmail.com`
      )
      .then((res) => {
        console.log(res);
        console.log(res.data.user);
        setUser({ ...res.data.user });
      });
    if (user.package == "0") {
      setPackageName("Free Package");
    } else if (user.package == "1") {
      setPackageName("Standard Package");
    } else {
      setPackageName("Premium Package");
    }
  }, []);

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

      {user.subscriptionId != "" && (
        <div className="my__package">
          <h1 style={{ marginTop: "50px" }}>My Subscription</h1>
          <div className="package__child">
            <div className="package__child1">
              <p> Subscription ID: {user.subscriptionId}</p>
              <p> Package Subscribed: {packageName}</p>
            </div>
            <div className="package__child2">
              <button
                onClick={cancelSubscription}
                className="cancel__subscription"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
