
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const router = express.Router();

// Create Stripe checkout session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const {
      productId,
      productName,
      quantity,
      pricePerUnit,
      buyerEmail,
      buyerName,
      shippingAddress,
      phoneNumber,
      notes,
    } = req.body;

    // Validate inputs
    if (
      !productId ||
      !productName ||
      !quantity ||
      !pricePerUnit ||
      !buyerEmail
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    if (pricePerUnit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be greater than 0",
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: productName,
              description: `Order for ${productName}`,
            },
            unit_amount: Math.round(pricePerUnit * 100), // Convert to cents
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      customer_email: buyerEmail,
      metadata: {
        productId: productId,
        productName: productName,
        quantity: quantity,
        pricePerUnit: pricePerUnit,
        buyerEmail: buyerEmail,
        buyerName: buyerName || "",
        shippingAddress: shippingAddress || "N/A",
        phoneNumber: phoneNumber || "N/A",
        notes: notes || "",
      },
      success_url: `${process.env.CLIENT_URL}/dashboard/my-orders?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/booking/${productId}?payment=canceled`,
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment session",
    });
  }
});

// Payment success webhook (for future)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        // Create order in database
        const user = await User.findOne({ email: session.customer_email });
        const product = await Product.findById(session.metadata.productId);

        if (user && product) {
          const order = new Order({
            product: session.metadata.productId,
            buyer: user._id,
            quantity: parseInt(session.metadata.quantity),
            unitPrice: parseFloat(session.metadata.pricePerUnit),
            totalAmount:
              parseFloat(session.metadata.pricePerUnit) *
              parseInt(session.metadata.quantity),
            shippingAddress: session.metadata.shippingAddress,
            phoneNumber: session.metadata.phoneNumber,
            notes: session.metadata.notes,
            paymentMethod: "payFirst",
            paymentStatus: "paid",
            stripeSessionId: session.id,
            status: "pending",
            tracking: [
              {
                status: "Order Placed",
                location: "Online Store",
                note: "Payment successful via Stripe",
                timestamp: new Date(),
              },
            ],
          });

          // Update product quantity
          product.quantity -= parseInt(session.metadata.quantity);
          await product.save();
          await order.save();

          console.log("✅ Order created from webhook:", order._id);
        }
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Webhook error:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

module.exports = router;
