import React from "react";
import "./Payment.css";

const paymentCardsData = [
  {
    plan: "Free",
    price: "Free",
    apiLimit: 10,
  },
  {
    plan: "Standard",
    price: "$30",
    apiLimit: 20,
  },
  {
    plan: "Free",
    price: "$80",
    apiLimit: 30,
  },
];

const PaymentCard = ({ data }: any) => {
  const { plan, price, apiLimit } = data;
  return (
    <div className="payment__card">
      <h2>{plan}</h2>
      <h1>{price}</h1>
      <div className="plan">
        <h3>API Rate Limit:</h3>
        <h2>{apiLimit}</h2>
      </div>
      <button>Choose</button>
    </div>
  );
};

const Payment = () => {
  return (
    <div className="payment__container">
      <h1>LISTING PACKAGES</h1>
      <h4>PLEASE SELECT A LISTING PACKAGE</h4>
      <div className="payment__card__container">
        {paymentCardsData.map((data: any, i: any) => (
          <PaymentCard data={data} key={i} />
        ))}
      </div>
    </div>
  );
};

export default Payment;
