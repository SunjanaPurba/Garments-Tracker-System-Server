// controllers/paymentController.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

exports.createOrderAfterPayment = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      shippingAddress,
      phoneNumber,
      notes,
      paymentMethod,
      totalAmount,
      stripeSessionId,
      buyerEmail,
    } = req.body;

    const user = await User.findOne({ email: buyerEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const order = new Order({
      product: productId,
      buyer: user._id,
      buyerName: user.name,
      buyerEmail: user.email,
      quantity: quantity,
      unitPrice: product.price,
      totalAmount: totalAmount,
      shippingAddress: shippingAddress,
      phoneNumber: phoneNumber,
      notes: notes || "",
      paymentMethod: paymentMethod || "payFirst",
      paymentStatus: "paid",
      stripeSessionId: stripeSessionId,
      status: "pending",
      tracking: [
        {
          status: "Order Placed",
          location: "Online Store",
          note: "Payment successful, order placed",
          timestamp: new Date(),
        },
      ],
    });
    product.quantity -= quantity;
    await product.save();

    await order.save();
    const populatedOrder = await Order.findById(order._id)
      .populate("product", "name price images category")
      .populate("buyer", "name email");

    res.status(201).json({
      success: true,
      message: "Order created successfully after payment",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Create order after payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order after payment",
    });
  }
};
