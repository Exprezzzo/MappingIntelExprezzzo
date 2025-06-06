const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Import and export the Stripe webhook function
exports.stripeWebhook = require("./stripeWebhook").stripeWebhook;
