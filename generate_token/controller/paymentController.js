const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../model/userModel");

const createSubscription = async (req, res) => {
  try {
    const { name, email, paymentMethod, priceId } = req.body;

    const user = await User.findOne({ email });
    if (user.subscriptionId != "") {
      res.status(406).json({
        success: false,
        message: "you already have subscription",
      });
    } else {
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
    }
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

// get character and scene name on the frontend
const getNames = async (req, res) => {
  try {
    res.send({
      characterName: process.env.characterName,
      sceneName:process.env.sceneName
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};


// get limits and rates of free , standard , premium packages
const getLimits = async (req, res) => {
  try {
    res.send({
      freeLimit:process.env.FREE_API_LIMIT ,
      standardLimit : process.env.STANDARD_API_LIMIT,
      premiumLimit : process.env.PREMIUM_API_LIMIT,
      standardCharges : process.env.STANDARD_API_CHARGES,
      premiumCharges :process.env.PREMIUM_API_CHARGES 
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

// cancelSubscription:
const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const user = await User.findOne({ subscriptionId });

    if (!user) {
      res.status(500).send({
        success: false,
      });
    } else {
      const deleted = await stripe.subscriptions.del(subscriptionId);
      user.subscriptionId = "";
      user.package ="0";
      await user.save(); // save changes to the User document
      res.status(200).send({
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

module.exports = {
  createSubscription,
  getPublishableKey,
  cancelSubscription,
  getNames,
  getLimits
};

// sub_1MuMO0H5DTXndbM5mRHbybUg
