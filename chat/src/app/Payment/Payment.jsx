import React, { useEffect, useState } from "react";
import "./Payment.css";
import { useNavigate , useParams } from "react-router-dom";
import axios from "axios";

const Payment = () => {
  const { email } = useParams();
  const [freeLimit, setfreeLimit] = useState('');
  const [standardLimit, setstandardLimit] = useState('');
  const [premiumLimit, setpremiumLimit] = useState('');
  const [standardCharges, setstandardCharges] = useState('');
  const [premiumCharges, setpremiumCharges] = useState('');
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
        navigate(`/`);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    axios
      .get(
        `http://localhost:4000/payment/package/get/${email}`
      )
      .then((res) => {
        console.log(res);
        console.log(res.data.user);
        setUser({ ...res.data.user });
      });
      axios
      .get(
        `http://localhost:4000/payment/limits`
      )

      .then((res) => {
        setfreeLimit(res.data.freeLimit)
        setstandardLimit(res.data.standardLimit)
        setpremiumLimit(res.data.premiumLimit)
        setstandardCharges(res.data.standardCharges)
        setpremiumCharges(res.data.premiumCharges)
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
            <h2>{freeLimit}</h2>
          </div>
          <button >Choose</button>
        </div>
        <div className="payment__card">
          <h2>STANDARD</h2>
          <h1>${standardCharges}</h1>
          <div className="plan">
            <h3>API Rate Limit:</h3>
            <h2>{standardLimit}</h2>
          </div>
          <button onClick={() => handleClick("price_1MtId7H5DTXndbM5S6011iYS")}>
            Choose
          </button>
        </div>
        <div className="payment__card">
          <h2>Premium</h2>
          <h1>$ {premiumCharges}</h1>
          <div className="plan">
            <h3>API Rate Limit:</h3>
            <h2>{premiumLimit}</h2>
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
