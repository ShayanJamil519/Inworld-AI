const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createSubscription = async (req, res) => {
  try {
    const { name, email, paymentMethod, priceId } = req.body;

    // create customer
    const customer = await stripe.customers.create({
      name: name,
      email: email,
      payment_method: paymentMethod,
      invoice_settings: {
        default_payment_method: paymentMethod,
      },
    });

    // console.log("customer: ", customer);
    console.log(name, email, paymentMethod, priceId);

    // create a stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          plan: priceId,
        },
      ],

      payment_settings: {
        payment_method_options: {
          card: {
            request_three_d_secure: "any",
          },
        },
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    });

    // console.log("subscription: ", subscription);
    res.status(200).json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
    });

    // return the client secret and subscription id
    return {
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
    };
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

// get publishable key on frontend:
const getPublishableKey = async (req, res) => {
  try {
    res.send({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

module.exports = {
  createSubscription,
  getPublishableKey,
};
