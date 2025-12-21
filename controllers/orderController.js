const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

exports.createOrder = async (req, res) => {
  try {
    console.log("🔵 Creating order for user:", req.user.email);
    console.log("🔵 Order data:", req.body);

    const {
      productId,
      quantity,
      shippingAddress,
      phoneNumber,
      notes,
      paymentMethod,
      totalAmount,
    } = req.body;

    if (
      !productId ||
      !quantity ||
      !shippingAddress ||
      !phoneNumber ||
      !totalAmount
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      console.log("❌ Product not found:", productId);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} items available`,
      });
    }

    const minOrder = product.minOrder || 1;
    if (quantity < minOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order quantity is ${minOrder}`,
      });
    }

    const orderData = {
      product: productId,
      buyer: req.user._id,
      quantity: parseInt(quantity),
      unitPrice: parseFloat(product.price),
      totalAmount: parseFloat(totalAmount),
      shippingAddress: shippingAddress,
      phoneNumber: phoneNumber,
      notes: notes || "",
      paymentMethod: paymentMethod || "payFirst",
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      status: "pending",
      tracking: [
        {
          status: "Order Placed",
          location: "Online Store",
          note: "Order has been placed successfully",
          timestamp: new Date(),
        },
      ],
    };

    console.log("🟡 Order data to save:", orderData);

    const order = new Order(orderData);

    await order.save();

    product.quantity -= parseInt(quantity);
    await product.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("product", "title price images category description")
      .populate("buyer", "name email");

    console.log("✅ Order created successfully:", populatedOrder._id);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("❌ Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Order creation failed: " + error.message,
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    console.log("🔵 Fetching orders for user:", req.user.email);

    const orders = await Order.find({ buyer: req.user._id })
      .populate("product", "title price images category")
      .sort({ createdAt: -1 });

    console.log("✅ Found orders:", orders.length);
    res.json(orders);
  } catch (error) {
    console.error("❌ Get my orders error:", error);
    res.status(500).json({
      message: "Failed to fetch your orders: " + error.message,
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    console.log("🔵 Admin fetching all orders");

    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("product", "title price category")
        .populate("buyer", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalOrders: total,
    });
  } catch (error) {
    console.error("❌ Get all orders error:", error);
    res.status(500).json({
      message: "Failed to fetch orders: " + error.message,
    });
  }
};

exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "pending" })
      .populate("product", "title price")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Get pending orders error:", error);
    res.status(500).json({ message: "Failed to fetch pending orders" });
  }
};
exports.getApprovedOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ["approved", "processing", "shipped"] },
    })
      .populate("product", "title price")
      .populate("buyer", "name email")
      .sort({ updatedAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Get approved orders error:", error);
    res.status(500).json({ message: "Failed to fetch approved orders" });
  }
};

exports.approveOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id)
      .populate("product")
      .populate("buyer");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.status = "approved";
    order.approvedAt = new Date();

    order.tracking.push({
      status: "Approved",
      location: "System",
      note: "Order has been approved by manager",
      timestamp: new Date(),
    });

    await order.save();

    res.json(order);
  } catch (error) {
    console.error("Approve order error:", error);
    res.status(500).json({ message: "Failed to approve order" });
  }
};

exports.rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id).populate("product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "approved") {
      const product = order.product;
      product.quantity += order.quantity;
      await product.save();
    }
    order.status = "rejected";

    order.tracking.push({
      status: "Rejected",
      location: "System",
      note: reason || "Order has been rejected",
      timestamp: new Date(),
    });

    await order.save();

    res.json(order);
  } catch (error) {
    console.error("Reject order error:", error);
    res.status(500).json({ message: "Failed to reject order" });
  }
};
exports.addTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.tracking.push({
      status,
      location,
      note: note || "",
      timestamp: new Date(),
    });

    const statusMap = {
      "Cutting Completed": "processing",
      "Sewing Started": "processing",
      Finishing: "processing",
      "QC Checked": "processing",
      Packed: "shipped",
      Shipped: "shipped",
      "Out for Delivery": "shipped",
      Delivered: "delivered",
    };

    if (statusMap[status]) {
      order.status = statusMap[status];
    }

    await order.save();

    res.json(order);
  } catch (error) {
    console.error("Add tracking error:", error);
    res.status(500).json({ message: "Failed to add tracking" });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id).populate("product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!["pending", "awaiting_payment"].includes(order.status)) {
      return res.status(400).json({
        message: "Cannot cancel order at this stage",
      });
    }

    if (order.status === "approved") {
      const product = order.product;
      product.quantity += order.quantity;
      await product.save();
    }

    order.status = "cancelled";

    order.tracking.push({
      status: "Cancelled",
      location: "System",
      note: "Order has been cancelled by user",
      timestamp: new Date(),
    });

    await order.save();

    res.json(order);
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id)
      .populate("product", "title price images category description")
      .populate("buyer", "name email phone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isManager = req.user.role === "manager";
    const isOwner = order.buyer._id.toString() === req.user._id.toString();

    if (!isAdmin && !isManager && !isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(order);
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ message: "Failed to get order" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;

    order.tracking.push({
      status: `Status Changed to ${status}`,
      location: "System",
      note: `Order status updated to ${status}`,
      timestamp: new Date(),
    });

    await order.save();

    res.json(order);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    res.json({
      stats,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({ message: "Failed to get order statistics" });
  }
};

module.exports = {
  createOrder: exports.createOrder,
  getMyOrders: exports.getMyOrders,
  getAllOrders: exports.getAllOrders,
  getPendingOrders: exports.getPendingOrders,
  getApprovedOrders: exports.getApprovedOrders,
  approveOrder: exports.approveOrder,
  rejectOrder: exports.rejectOrder,
  addTracking: exports.addTracking,
  cancelOrder: exports.cancelOrder,
  getOrderById: exports.getOrderById,
  updateOrderStatus: exports.updateOrderStatus,
  getOrderStats: exports.getOrderStats,
};
