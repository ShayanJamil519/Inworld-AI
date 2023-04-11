import React, { useEffect, useState } from "react";
import "./Payment.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Payment = () => {
  const { email } = useParams();
  const [freeLimit, setfreeLimit] = useState("");
  const [standardLimit, setstandardLimit] = useState("");
  const [premiumLimit, setpremiumLimit] = useState("");
  const [standardCharges, setstandardCharges] = useState("");
  const [premiumCharges, setpremiumCharges] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [packageName, setPackageName] = useState("");

  function handleClick(priceId) {
    navigate(`/payment/checkout/${priceId}/${email}`);
  }
  function backtochat() {
    navigate(`/chat/${email}`);
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
        //console.log(JSON.stringify(response.data));
        toast.success("Your subsciption has been cancelled");
        navigate(`/chat/${email}`);
      })
      .catch((error) => {
        //console.log(error);
        toast.error(error.message);
      });
  };

  useEffect(() => {
    axios
      .get(`http://localhost:4000/payment/package/get/${email}`)
      .then((res) => {
        console.log(res);
        console.log(res.data.user);
        setUser({ ...res.data.user });
      });
    axios
      .get(`http://localhost:4000/payment/limits`)

      .then((res) => {
        setfreeLimit(res.data.freeLimit);
        setstandardLimit(res.data.standardLimit);
        setpremiumLimit(res.data.premiumLimit);
        setstandardCharges(res.data.standardCharges);
        setpremiumCharges(res.data.premiumCharges);
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
      {/* SVG Shape */}
      <div class="custom-shape-divider-top-1681188123">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            class="shape-fill"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            class="shape-fill"
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            class="shape-fill"
          ></path>
        </svg>
      </div>
      <h1>LISTING PACKAGES</h1>
      <h4>Please Select a Listing Package</h4>
      <div className="payment__card__container">
        <div className="payment__card">
          <h2>Free</h2>
          <h1>Free</h1>
          <div className="plan">
            <h3>API Rate Limit:</h3>
            <h2>{freeLimit}</h2>
          </div>
          <button>Choose</button>
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

      {user.subscriptionId != "" ? (
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
      ) : (
        <div className="my__package">
          <h1>You Don't Have Any Subscriptions</h1>
        </div>
      )}
      <div className="my__package">
        <button onClick={backtochat} className="back">
          Back To Chat
        </button>
      </div>
      {/* SVG Shape */}
      <div class="custom-shape-divider-bottom-1681188330">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M600,112.77C268.63,112.77,0,65.52,0,7.23V120H1200V7.23C1200,65.52,931.37,112.77,600,112.77Z"
            class="shape-fill"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default Payment;
