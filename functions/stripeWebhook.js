const functions = require("firebase-functions");
const Stripe = require("stripe");
const express = require("express");
const bodyParser = require("body-parser");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(bodyParser.raw({ type: "application/json" }));

app.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Example event handling
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ Checkout Session completed:", session.id);
  }

  res.status(200).send("✅ Webhook received");
});

exports.stripeWebhook = functions.https.onRequest(app);
