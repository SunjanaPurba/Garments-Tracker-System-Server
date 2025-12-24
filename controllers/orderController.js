// // const mongoose = require("mongoose");
// // const Order = require("../models/Order");
// // const Product = require("../models/Product");

// // exports.createOrder = async (req, res) => {
// //   try {
// //     console.log("🔵 Creating order for user:", req.user.email);
// //     console.log("🔵 Order data:", req.body);

// //     const {
// //       productId,
// //       quantity,
// //       shippingAddress,
// //       phoneNumber,
// //       notes,
// //       paymentMethod,
// //       totalAmount,
// //     } = req.body;

// //     if (
// //       !productId ||
// //       !quantity ||
// //       !shippingAddress ||
// //       !phoneNumber ||
// //       !totalAmount
// //     ) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Missing required fields",
// //       });
// //     }

// //     const product = await Product.findById(productId);
// //     if (!product) {
// //       console.log("❌ Product not found:", productId);
// //       return res.status(404).json({
// //         success: false,
// //         message: "Product not found",
// //       });
// //     }

// //     if (product.quantity < quantity) {
// //       return res.status(400).json({
// //         success: false,
// //         message: `Only ${product.quantity} items available`,
// //       });
// //     }

// //     const minOrder = product.minOrder || 1;
// //     if (quantity < minOrder) {
// //       return res.status(400).json({
// //         success: false,
// //         message: `Minimum order quantity is ${minOrder}`,
// //       });
// //     }

// //     const orderData = {
// //       product: productId,
// //       buyer: req.user._id,
// //       quantity: parseInt(quantity),
// //       unitPrice: parseFloat(product.price),
// //       totalAmount: parseFloat(totalAmount),
// //       shippingAddress: shippingAddress,
// //       phoneNumber: phoneNumber,
// //       notes: notes || "",
// //       paymentMethod: paymentMethod || "payFirst",
// //       paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
// //       status: "pending",
// //       tracking: [
// //         {
// //           status: "Order Placed",
// //           location: "Online Store",
// //           note: "Order has been placed successfully",
// //           timestamp: new Date(),
// //         },
// //       ],
// //     };

// //     console.log("🟡 Order data to save:", orderData);

// //     const order = new Order(orderData);

// //     await order.save();

// //     product.quantity -= parseInt(quantity);
// //     await product.save();

// //     const populatedOrder = await Order.findById(order._id)
// //       .populate("product", "title price images category description")
// //       .populate("buyer", "name email");

// //     console.log("✅ Order created successfully:", populatedOrder._id);

// //     res.status(201).json({
// //       success: true,
// //       message: "Order created successfully",
// //       order: populatedOrder,
// //     });
// //   } catch (error) {
// //     console.error("❌ Order creation error:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Order creation failed: " + error.message,
// //     });
// //   }
// // };

// // exports.getMyOrders = async (req, res) => {
// //   try {
// //     console.log("🔵 Fetching orders for user:", req.user.email);

// //     const orders = await Order.find({ buyer: req.user._id })
// //       .populate("product", "title price images category")
// //       .sort({ createdAt: -1 });

// //     console.log("✅ Found orders:", orders.length);
// //     res.json(orders);
// //   } catch (error) {
// //     console.error("❌ Get my orders error:", error);
// //     res.status(500).json({
// //       message: "Failed to fetch your orders: " + error.message,
// //     });
// //   }
// // };

// // exports.getAllOrders = async (req, res) => {
// //   try {
// //     console.log("🔵 Admin fetching all orders");

// //     const { status, page = 1, limit = 10 } = req.query;

// //     const filter = {};
// //     if (status && status !== "all") {
// //       filter.status = status;
// //     }

// //     const skip = (parseInt(page) - 1) * parseInt(limit);

// //     const [orders, total] = await Promise.all([
// //       Order.find(filter)
// //         .populate("product", "title price category")
// //         .populate("buyer", "name email")
// //         .sort({ createdAt: -1 })
// //         .skip(skip)
// //         .limit(parseInt(limit)),
// //       Order.countDocuments(filter),
// //     ]);

// //     res.json({
// //       orders,
// //       currentPage: parseInt(page),
// //       totalPages: Math.ceil(total / parseInt(limit)),
// //       totalOrders: total,
// //     });
// //   } catch (error) {
// //     console.error("❌ Get all orders error:", error);
// //     res.status(500).json({
// //       message: "Failed to fetch orders: " + error.message,
// //     });
// //   }
// // };

// // exports.getPendingOrders = async (req, res) => {
// //   try {
// //     const orders = await Order.find({ status: "pending" })
// //       .populate("product", "title price")
// //       .populate("buyer", "name email")
// //       .sort({ createdAt: -1 });

// //     res.json(orders);
// //   } catch (error) {
// //     console.error("Get pending orders error:", error);
// //     res.status(500).json({ message: "Failed to fetch pending orders" });
// //   }
// // };
// // exports.getApprovedOrders = async (req, res) => {
// //   try {
// //     const orders = await Order.find({
// //       status: { $in: ["approved", "processing", "shipped"] },
// //     })
// //       .populate("product", "title price")
// //       .populate("buyer", "name email")
// //       .sort({ updatedAt: -1 });

// //     res.json(orders);
// //   } catch (error) {
// //     console.error("Get approved orders error:", error);
// //     res.status(500).json({ message: "Failed to fetch approved orders" });
// //   }
// // };

// // exports.approveOrder = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     if (!mongoose.Types.ObjectId.isValid(id)) {
// //       return res.status(400).json({ message: "Invalid order ID" });
// //     }

// //     const order = await Order.findById(id)
// //       .populate("product")
// //       .populate("buyer");

// //     if (!order) {
// //       return res.status(404).json({ message: "Order not found" });
// //     }
// //     order.status = "approved";
// //     order.approvedAt = new Date();

// //     order.tracking.push({
// //       status: "Approved",
// //       location: "System",
// //       note: "Order has been approved by manager",
// //       timestamp: new Date(),
// //     });

// //     await order.save();

// //     res.json(order);
// //   } catch (error) {
// //     console.error("Approve order error:", error);
// //     res.status(500).json({ message: "Failed to approve order" });
// //   }
// // };

// // exports.rejectOrder = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const { reason } = req.body;

// //     if (!mongoose.Types.ObjectId.isValid(id)) {
// //       return res.status(400).json({ message: "Invalid order ID" });
// //     }

// //     const order = await Order.findById(id).populate("product");

// //     if (!order) {
// //       return res.status(404).json({ message: "Order not found" });
// //     }

// //     if (order.status === "approved") {
// //       const product = order.product;
// //       product.quantity += order.quantity;
// //       await product.save();
// //     }
// //     order.status = "rejected";

// //     order.tracking.push({
// //       status: "Rejected",
// //       location: "System",
// //       note: reason || "Order has been rejected",
// //       timestamp: new Date(),
// //     });

// //     await order.save();

// //     res.json(order);
// //   } catch (error) {
// //     console.error("Reject order error:", error);
// //     res.status(500).json({ message: "Failed to reject order" });
// //   }
// // };
// // exports.addTracking = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const { status, location, note } = req.body;

// //     if (!mongoose.Types.ObjectId.isValid(id)) {
// //       return res.status(400).json({ message: "Invalid order ID" });
// //     }

// //     const order = await Order.findById(id);

// //     if (!order) {
// //       return res.status(404).json({ message: "Order not found" });
// //     }

// //     order.tracking.push({
// //       status,
// //       location,
// //       note: note || "",
// //       timestamp: new Date(),
// //     });

// //     const statusMap = {
// //       "Cutting Completed": "processing",
// //       "Sewing Started": "processing",
// //       Finishing: "processing",
// //       "QC Checked": "processing",
// //       Packed: "shipped",
// //       Shipped: "shipped",
// //       "Out for Delivery": "shipped",
// //       Delivered: "delivered",
// //     };

// //     if (statusMap[status]) {
// //       order.status = statusMap[status];
// //     }

// //     await order.save();

// //     res.json(order);
// //   } catch (error) {
// //     console.error("Add tracking error:", error);
// //     res.status(500).json({ message: "Failed to add tracking" });
// //   }
// // };

// // exports.cancelOrder = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     if (!mongoose.Types.ObjectId.isValid(id)) {
// //       return res.status(400).json({ message: "Invalid order ID" });
// //     }

// //     const order = await Order.findById(id).populate("product");

// //     if (!order) {
// //       return res.status(404).json({ message: "Order not found" });
// //     }

// //     if (order.buyer.toString() !== req.user._id.toString()) {
// //       return res.status(403).json({ message: "Forbidden" });
// //     }

// //     if (!["pending", "awaiting_payment"].includes(order.status)) {
// //       return res.status(400).json({
// //         message: "Cannot cancel order at this stage",
// //       });
// //     }

// //     if (order.status === "approved") {
// //       const product = order.product;
// //       product.quantity += order.quantity;
// //       await product.save();
// //     }

// //     order.status = "cancelled";

// //     order.tracking.push({
// //       status: "Cancelled",
// //       location: "System",
// //       note: "Order has been cancelled by user",
// //       timestamp: new Date(),
// //     });

// //     await order.save();

// //     res.json(order);
// //   } catch (error) {
// //     console.error("Cancel order error:", error);
// //     res.status(500).json({ message: "Failed to cancel order" });
// //   }
// // };

// // exports.getOrderById = async (req, res) => {
// //   try {
// //     const { id } = req.params;

// //     if (!mongoose.Types.ObjectId.isValid(id)) {
// //       return res.status(400).json({ message: "Invalid order ID" });
// //     }

// //     const order = await Order.findById(id)
// //       .populate("product", "title price images category description")
// //       .populate("buyer", "name email phone");

// //     if (!order) {
// //       return res.status(404).json({ message: "Order not found" });
// //     }

// //     const isAdmin = req.user.role === "admin";
// //     const isManager = req.user.role === "manager";
// //     const isOwner = order.buyer._id.toString() === req.user._id.toString();

// //     if (!isAdmin && !isManager && !isOwner) {
// //       return res.status(403).json({ message: "Forbidden" });
// //     }

// //     res.json(order);
// //   } catch (error) {
// //     console.error("Get order by ID error:", error);
// //     res.status(500).json({ message: "Failed to get order" });
// //   }
// // };

// // exports.updateOrderStatus = async (req, res) => {
// //   try {
// //     const { id } = req.params;
// //     const { status } = req.body;

// //     if (!mongoose.Types.ObjectId.isValid(id)) {
// //       return res.status(400).json({ message: "Invalid order ID" });
// //     }

// //     const order = await Order.findById(id);

// //     if (!order) {
// //       return res.status(404).json({ message: "Order not found" });
// //     }

// //     order.status = status;

// //     order.tracking.push({
// //       status: `Status Changed to ${status}`,
// //       location: "System",
// //       note: `Order status updated to ${status}`,
// //       timestamp: new Date(),
// //     });

// //     await order.save();

// //     res.json(order);
// //   } catch (error) {
// //     console.error("Update order status error:", error);
// //     res.status(500).json({ message: "Failed to update order status" });
// //   }
// // };

// // exports.getOrderStats = async (req, res) => {
// //   try {
// //     const stats = await Order.aggregate([
// //       {
// //         $group: {
// //           _id: "$status",
// //           count: { $sum: 1 },
// //           totalRevenue: { $sum: "$totalAmount" },
// //         },
// //       },
// //     ]);

// //     const totalOrders = await Order.countDocuments();
// //     const totalRevenue = await Order.aggregate([
// //       { $match: { status: { $ne: "cancelled" } } },
// //       { $group: { _id: null, total: { $sum: "$totalAmount" } } },
// //     ]);

// //     res.json({
// //       stats,
// //       totalOrders,
// //       totalRevenue: totalRevenue[0]?.total || 0,
// //     });
// //   } catch (error) {
// //     console.error("Get order stats error:", error);
// //     res.status(500).json({ message: "Failed to get order statistics" });
// //   }
// // };

// // module.exports = {
// //   createOrder: exports.createOrder,
// //   getMyOrders: exports.getMyOrders,
// //   getAllOrders: exports.getAllOrders,
// //   getPendingOrders: exports.getPendingOrders,
// //   getApprovedOrders: exports.getApprovedOrders,
// //   approveOrder: exports.approveOrder,
// //   rejectOrder: exports.rejectOrder,
// //   addTracking: exports.addTracking,
// //   cancelOrder: exports.cancelOrder,
// //   getOrderById: exports.getOrderById,
// //   updateOrderStatus: exports.updateOrderStatus,
// //   getOrderStats: exports.getOrderStats,
// // };

// // exports.createOrder = async (req, res) => {
// //   try {
// //     console.log("🔵 Creating order for user:", req.user.email);
// //     console.log("🔵 Order data:", req.body);

// //     const {
// //       productId,
// //       quantity,
// //       shippingAddress,
// //       phoneNumber,
// //       notes,
// //       paymentMethod = "payFirst", // default
// //       totalAmount,
// //     } = req.body;

// //     // Required fields check
// //     if (!productId || !quantity || !shippingAddress || !phoneNumber || !totalAmount) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Missing required fields: productId, quantity, shippingAddress, phoneNumber, totalAmount",
// //       });
// //     }

// //     // 🔥 FIND PRODUCT WITHOUT TRIGGERING VALIDATION
// //     const product = await Product.findById(productId).lean(); // ← .lean() use করো যাতে Mongoose document না হয়

// //     if (!product) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Product not found",
// //       });
// //     }

// //     // Stock & min order check
// //     if (product.quantity < quantity) {
// //       return res.status(400).json({
// //         success: false,
// //         message: `Only ${product.quantity} units available in stock`,
// //       });
// //     }

// //     if (quantity < (product.minOrder || 1)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: `Minimum order quantity is ${product.minOrder || 1}`,
// //       });
// //     }

// //     // Create order
// //     const orderData = {
// //       product: productId,
// //       buyer: req.user._id,
// //       quantity: parseInt(quantity),
// //       unitPrice: product.price,
// //       totalAmount: parseFloat(totalAmount),
// //       shippingAddress,
// //       phoneNumber,
// //       notes: notes || "",
// //       paymentMethod: paymentMethod || "payFirst", // cod or payFirst
// //       paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
// //       status: "pending",
// //       tracking: [
// //         {
// //           status: "Order Placed",
// //           location: "Online",
// //           note: "Order received successfully",
// //           timestamp: new Date(),
// //         },
// //       ],
// //     };

// //     const order = new Order(orderData);
// //     await order.save();

// //     // Update stock (no validation trigger)
// //     await Product.updateOne(
// //       { _id: productId },
// //       { $inc: { quantity: -parseInt(quantity) } }
// //     );

// //     // Populate for response
// //     const populatedOrder = await Order.findById(order._id)
// //       .populate("product", "title price images category")
// //       .populate("buyer", "name email");

// //     console.log("✅ Order created:", order._id);

// //     res.status(201).json({
// //       success: true,
// //       message: "Order placed successfully",
// //       order: populatedOrder,
// //     });
// //   } catch (error) {
// //     console.error("❌ Order creation error:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Order creation failed: " + error.message,
// //     });
// //   }
// // };



// const Order = require("../models/Order");
// const Product = require("../models/Product");

// // Create Order (Buyer)
// exports.createOrder = async (req, res) => {
//   try {
//     console.log("🔵 Creating order for user:", req.user.email);
//     console.log("🔵 Order data received:", req.body);

//     const {
//       productId,
//       quantity,
//       shippingAddress,
//       phoneNumber,
//       notes = "",
//       paymentMethod = "cod",
//       paymentType = "cashOnDelivery",
//       totalAmount,
//     } = req.body;

//     // Required fields validation
//     if (!productId || !quantity || !shippingAddress || !phoneNumber || !totalAmount || !paymentType) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields",
//       });
//     }

//     // Fetch product
//     const product = await Product.findById(productId).lean();

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     // Stock check
//     if (product.quantity < quantity) {
//       return res.status(400).json({
//         success: false,
//         message: `Only ${product.quantity} units available in stock`,
//       });
//     }

//     // Min order check
//     if (quantity < (product.minOrder || 1)) {
//       return res.status(400).json({
//         success: false,
//         message: `Minimum order quantity is ${product.minOrder || 1}`,
//       });
//     }

//     // Create order data
//     const orderData = {
//       product: productId,
//       buyer: req.user._id,
//       quantity: parseInt(quantity),
//       unitPrice: product.price,
//       totalAmount: parseFloat(totalAmount),
//       shippingAddress,
//       phoneNumber,
//       notes,
//       paymentMethod,
//       paymentType,
//       paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
//       status: "pending",
//       tracking: [
//         {
//           status: "Order Placed",
//           location: "Online",
//           note: "Your order has been received",
//           timestamp: new Date(),
//         },
//       ],
//     };

//     // Save order
//     const order = new Order(orderData);
//     await order.save();

//     // Decrease stock
//     await Product.updateOne(
//       { _id: productId },
//       { $inc: { quantity: -parseInt(quantity) } }
//     );

//     // Populate for response
//     const populatedOrder = await Order.findById(order._id)
//       .populate("product", "title price images category")
//       .populate("buyer", "name email");

//     console.log("✅ Order created successfully:", order._id);

//     res.status(201).json({
//       success: true,
//       message: "Order placed successfully",
//       order: populatedOrder,
//     });
//   } catch (error) {
//     console.error("❌ Order creation error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Order creation failed: " + error.message,
//     });
//   }
// };

// // Get My Orders (Buyer)
// exports.getMyOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ buyer: req.user._id })
//       .populate("product", "title price images category")
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       orders,
//     });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch orders",
//     });
//   }
// };

// // Get Single Order
// exports.getOrderById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await Order.findById(id)
//       .populate("product", "title price images category description")
//       .populate("buyer", "name email phone");

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     // Authorization check
//     if (order.buyer._id.toString() !== req.user._id.toString() && 
//         req.user.role !== "admin" && 
//         req.user.role !== "manager") {
//       return res.status(403).json({ success: false, message: "Unauthorized" });
//     }

//     res.json({ success: true, order });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Cancel Order (Buyer - only pending)
// exports.cancelOrder = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await Order.findOne({ _id: id, buyer: req.user._id });

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     if (order.status !== "pending") {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Only pending orders can be cancelled" 
//       });
//     }

//     order.status = "cancelled";
//     order.tracking.push({
//       status: "Cancelled",
//       note: "Cancelled by buyer",
//       timestamp: new Date(),
//     });
//     await order.save();

//     // Restore stock
//     await Product.updateOne(
//       { _id: order.product },
//       { $inc: { quantity: order.quantity } }
//     );

//     res.json({ 
//       success: true, 
//       message: "Order cancelled successfully", 
//       order 
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ===========================
// // ADMIN & MANAGER FUNCTIONS
// // ===========================

// // Get All Orders (Admin)
// exports.getAllOrders = async (req, res) => {
//   try {
//     const { page = 1, limit = 20, status } = req.query;
//     const query = {};
    
//     if (status) {
//       query.status = status;
//     }

//     const orders = await Order.find(query)
//       .populate("product", "title price")
//       .populate("buyer", "name email")
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await Order.countDocuments(query);

//     res.json({
//       success: true,
//       orders,
//       totalPages: Math.ceil(total / limit),
//       currentPage: parseInt(page),
//       totalOrders: total,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get Pending Orders (Manager)
// exports.getPendingOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ status: "pending" })
//       .populate("product", "title price images")
//       .populate("buyer", "name email")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, orders });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get Approved Orders (Manager)
// exports.getApprovedOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ 
//       status: { $in: ["approved", "processing", "shipped", "delivered"] } 
//     })
//       .populate("product", "title price images")
//       .populate("buyer", "name email")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, orders });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Approve Order (Manager)
// exports.approveOrder = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await Order.findById(id);

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     if (order.status !== "pending") {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Only pending orders can be approved" 
//       });
//     }

//     order.status = "approved";
//     order.approvedAt = new Date();
//     order.tracking.push({
//       status: "Approved",
//       note: "Order approved by manager",
//       timestamp: new Date(),
//     });
//     await order.save();

//     res.json({ 
//       success: true, 
//       message: "Order approved successfully", 
//       order 
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Reject Order (Manager)
// exports.rejectOrder = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await Order.findById(id);

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     if (order.status !== "pending") {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Only pending orders can be rejected" 
//       });
//     }

//     order.status = "rejected";
//     order.tracking.push({
//       status: "Rejected",
//       note: req.body.reason || "Order rejected by manager",
//       timestamp: new Date(),
//     });
//     await order.save();

//     // Restore stock
//     await Product.updateOne(
//       { _id: order.product },
//       { $inc: { quantity: order.quantity } }
//     );

//     res.json({ 
//       success: true, 
//       message: "Order rejected successfully", 
//       order 
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Add Tracking (Manager)
// exports.addTracking = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, location, note } = req.body;

//     if (!status) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Status is required" 
//       });
//     }

//     const order = await Order.findById(id);
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     // Add tracking entry
//     order.tracking.push({
//       status,
//       location: location || "Warehouse",
//       note: note || "",
//       timestamp: new Date(),
//     });

//     // Update main status if it's a significant status change
//     const significantStatuses = ["processing", "shipped", "delivered"];
//     if (significantStatuses.includes(status.toLowerCase())) {
//       order.status = status.toLowerCase();
//     }

//     await order.save();

//     res.json({ 
//       success: true, 
//       message: "Tracking updated successfully", 
//       order 
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Update Order Status (Manager)
// exports.updateOrderStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (!status) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Status is required" 
//       });
//     }

//     const validStatuses = [
//       "pending",
//       "approved",
//       "processing",
//       "shipped",
//       "delivered",
//       "cancelled",
//       "rejected",
//     ];

//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid status" 
//       });
//     }

//     const order = await Order.findById(id);
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     const oldStatus = order.status;
//     order.status = status;
    
//     // Add tracking entry for status change
//     order.tracking.push({
//       status: status.charAt(0).toUpperCase() + status.slice(1),
//       note: `Status changed from ${oldStatus} to ${status}`,
//       timestamp: new Date(),
//     });

//     // If rejecting or cancelling, restore stock
//     if ((status === "rejected" || status === "cancelled") && 
//         oldStatus !== "rejected" && oldStatus !== "cancelled") {
//       await Product.updateOne(
//         { _id: order.product },
//         { $inc: { quantity: order.quantity } }
//       );
//     }

//     await order.save();

//     res.json({ 
//       success: true, 
//       message: "Order status updated successfully", 
//       order 
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get Order Statistics (Admin) - Optional
// exports.getOrderStats = async (req, res) => {
//   try {
//     const totalOrders = await Order.countDocuments();
//     const pendingOrders = await Order.countDocuments({ status: "pending" });
//     const approvedOrders = await Order.countDocuments({ status: "approved" });
//     const deliveredOrders = await Order.countDocuments({ status: "delivered" });
    
//     // Calculate total revenue from delivered orders
//     const revenueResult = await Order.aggregate([
//       { $match: { status: "delivered" } },
//       { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
//     ]);

//     const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

//     res.json({
//       success: true,
//       stats: {
//         totalOrders,
//         pendingOrders,
//         approvedOrders,
//         deliveredOrders,
//         totalRevenue,
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

// Create Order (Buyer)
exports.createOrder = async (req, res) => {
  try {
    console.log("🔵 Creating order for user:", req.user?.email);
    console.log("🔵 Order data received:", req.body);

    // User authentication check
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const {
      productId,
      quantity,
      shippingAddress,
      phoneNumber,
      notes = "",
      paymentMethod = "cod",
      paymentType = "cashOnDelivery",
      totalAmount,
    } = req.body;

    // Required fields validation
    const requiredFields = { productId, quantity, shippingAddress, phoneNumber, totalAmount, paymentType };
    const missingFields = Object.keys(requiredFields).filter(key => !requiredFields[key]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`
      });
    }

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }

    // Fetch product
    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Convert quantity to number
    const orderQuantity = parseInt(quantity);
    if (isNaN(orderQuantity) || orderQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity"
      });
    }

    // Stock check
    if (product.quantity < orderQuantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} units available in stock`
      });
    }

    // Min order check
    const minOrder = product.minOrder || 1;
    if (orderQuantity < minOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order quantity is ${minOrder}`
      });
    }

    // Calculate total amount if not provided
    const calculatedTotal = parseFloat(totalAmount) || (product.price * orderQuantity);
    if (isNaN(calculatedTotal) || calculatedTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid total amount"
      });
    }

    // Create order data
    const orderData = {
      product: productId,
      buyer: req.user._id,
      quantity: orderQuantity,
      unitPrice: product.price,
      totalAmount: calculatedTotal,
      shippingAddress,
      phoneNumber,
      notes,
      paymentMethod,
      paymentType,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      status: "pending",
      tracking: [
        {
          status: "Order Placed",
          location: "Online",
          note: "Your order has been received",
          timestamp: new Date(),
        },
      ],
    };

    // Start MongoDB session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Save order
      const order = new Order(orderData);
      await order.save({ session });

      // Decrease stock
      await Product.updateOne(
        { _id: productId },
        { $inc: { quantity: -orderQuantity } },
        { session }
      );

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Populate for response
      const populatedOrder = await Order.findById(order._id)
        .populate("product", "title price images category")
        .populate("buyer", "name email");

      console.log("✅ Order created successfully:", order._id);

      return res.status(201).json({
        success: true,
        message: "Order placed successfully",
        order: populatedOrder,
      });

    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }

  } catch (error) {
    console.error("❌ Order creation error:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error: " + error.message
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid data format"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Order creation failed: " + error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get My Orders (Buyer)
exports.getMyOrders = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const orders = await Order.find({ buyer: req.user._id })
      .populate("product", "title price images category")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders: " + error.message
    });
  }
};

// Get Single Order
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid order ID format" 
      });
    }

    const order = await Order.findById(id)
      .populate("product", "title price images category description")
      .populate("buyer", "name email phone");

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Authorization check
    const isBuyer = order.buyer && order.buyer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isManager = req.user.role === "manager";

    if (!isBuyer && !isAdmin && !isManager) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized access to this order" 
      });
    }

    return res.json({ 
      success: true, 
      order 
    });
  } catch (error) {
    console.error("Get order by ID error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to get order: " + error.message 
    });
  }
};

// Cancel Order (Buyer - only pending)
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid order ID" 
      });
    }

    const order = await Order.findOne({ 
      _id: id, 
      buyer: req.user._id 
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found or you don't have permission" 
      });
    }

    // Only allow cancellation of pending orders
    if (order.status !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel order with status: ${order.status}. Only pending orders can be cancelled.` 
      });
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update order status
      order.status = "cancelled";
      order.tracking.push({
        status: "Cancelled",
        location: "System",
        note: "Cancelled by buyer",
        timestamp: new Date(),
      });
      await order.save({ session });

      // Restore stock
      await Product.updateOne(
        { _id: order.product },
        { $inc: { quantity: order.quantity } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return res.json({ 
        success: true, 
        message: "Order cancelled successfully", 
        order 
      });
    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }

  } catch (error) {
    console.error("Cancel order error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to cancel order: " + error.message 
    });
  }
};

// ===========================
// ADMIN & MANAGER FUNCTIONS
// ===========================

// Get All Orders (Admin/Manager)
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    
    // Status filter
    if (status && status !== "all") {
      query.status = status;
    }
    
    // Search by buyer name or product title
    if (search) {
      query.$or = [
        { "buyer.name": { $regex: search, $options: "i" } },
        { "product.title": { $regex: search, $options: "i" } }
      ];
    }

    // Parse pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute queries in parallel
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("product", "title price images")
        .populate("buyer", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(query)
    ]);

    return res.json({
      success: true,
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalOrders: total,
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch orders: " + error.message 
    });
  }
};

// Get Pending Orders (Manager)
exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "pending" })
      .populate("product", "title price images")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    return res.json({ 
      success: true, 
      count: orders.length,
      orders 
    });
  } catch (error) {
    console.error("Get pending orders error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch pending orders: " + error.message 
    });
  }
};

// Get Approved/Processing Orders (Manager)
exports.getApprovedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      status: { $in: ["approved", "processing", "shipped", "delivered"] } 
    })
      .populate("product", "title price images")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    return res.json({ 
      success: true, 
      count: orders.length,
      orders 
    });
  } catch (error) {
    console.error("Get approved orders error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch approved orders: " + error.message 
    });
  }
};

// Approve Order (Manager)
exports.approveOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid order ID" 
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Check if order can be approved
    if (order.status !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: `Order cannot be approved. Current status: ${order.status}` 
      });
    }

    // Update order
    order.status = "approved";
    order.approvedAt = new Date();
    order.tracking.push({
      status: "Approved",
      location: "System",
      note: "Order approved by manager",
      timestamp: new Date(),
    });

    await order.save();

    return res.json({ 
      success: true, 
      message: "Order approved successfully", 
      order 
    });
  } catch (error) {
    console.error("Approve order error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to approve order: " + error.message 
    });
  }
};

// Reject Order (Manager)
exports.rejectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid order ID" 
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Check if order can be rejected
    if (order.status !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: `Order cannot be rejected. Current status: ${order.status}` 
      });
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update order status
      order.status = "rejected";
      order.tracking.push({
        status: "Rejected",
        location: "System",
        note: reason || "Order rejected by manager",
        timestamp: new Date(),
      });
      await order.save({ session });

      // Restore stock
      await Product.updateOne(
        { _id: order.product },
        { $inc: { quantity: order.quantity } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return res.json({ 
        success: true, 
        message: "Order rejected successfully", 
        order 
      });
    } catch (transactionError) {
      await session.abortTransaction();
      session.endSession();
      throw transactionError;
    }

  } catch (error) {
    console.error("Reject order error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to reject order: " + error.message 
    });
  }
};

// Add Tracking (Manager)
exports.addTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, location, note } = req.body;

    // Validate inputs
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: "Tracking status is required" 
      });
    }

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid order ID" 
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Add tracking entry
    order.tracking.push({
      status,
      location: location || "Warehouse",
      note: note || "",
      timestamp: new Date(),
    });

    // Update main status for significant status changes
    const statusMap = {
      "processing": "processing",
      "shipped": "shipped",
      "delivered": "delivered",
      "Processing": "processing",
      "Shipped": "shipped",
      "Delivered": "delivered"
    };

    if (statusMap[status]) {
      order.status = statusMap[status];
    }

    await order.save();

    return res.json({ 
      success: true, 
      message: "Tracking updated successfully", 
      order 
    });
  } catch (error) {
    console.error("Add tracking error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to add tracking: " + error.message 
    });
  }
};

// Update Order Status (Manager/Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    // Validate inputs
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: "Status is required" 
      });
    }

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid order ID" 
      });
    }

    // Valid statuses
    const validStatuses = [
      "pending",
      "approved",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "rejected",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    const oldStatus = order.status;
    
    // Check if status transition is valid
    const validTransitions = {
      "pending": ["approved", "rejected", "cancelled"],
      "approved": ["processing", "cancelled"],
      "processing": ["shipped", "cancelled"],
      "shipped": ["delivered"],
      "delivered": [],
      "cancelled": [],
      "rejected": []
    };

    if (!validTransitions[oldStatus]?.includes(status) && oldStatus !== status) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${oldStatus} to ${status}`
      });
    }

    // Start transaction if changing to cancelled/rejected
    if ((status === "rejected" || status === "cancelled") && 
        !["rejected", "cancelled"].includes(oldStatus)) {
      
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        order.status = status;
        order.tracking.push({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          location: "System",
          note: note || `Status changed from ${oldStatus} to ${status}`,
          timestamp: new Date(),
        });
        await order.save({ session });

        // Restore stock
        await Product.updateOne(
          { _id: order.product },
          { $inc: { quantity: order.quantity } },
          { session }
        );

        await session.commitTransaction();
        session.endSession();
      } catch (transactionError) {
        await session.abortTransaction();
        session.endSession();
        throw transactionError;
      }
    } else {
      // Simple status update
      order.status = status;
      order.tracking.push({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        location: "System",
        note: note || `Status changed from ${oldStatus} to ${status}`,
        timestamp: new Date(),
      });
      await order.save();
    }

    return res.json({ 
      success: true, 
      message: "Order status updated successfully", 
      order 
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to update order status: " + error.message 
    });
  }
};

// Get Order Statistics (Admin)
exports.getOrderStats = async (req, res) => {
  try {
    // Get counts for each status
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { 
            $sum: { 
              $cond: [{ $ne: ["$status", "cancelled"] }, "$totalAmount", 0] 
            }
          }
        }
      }
    ]);

    // Get total counts
    const totalOrders = await Order.countDocuments();
    
    // Get revenue from delivered orders
    const revenueResult = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);

    // Get daily orders for last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const dailyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: lastWeek } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Format status counts
    const stats = {};
    statusCounts.forEach(item => {
      stats[item._id] = {
        count: item.count,
        revenue: item.totalRevenue
      };
    });

    return res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: revenueResult[0]?.totalRevenue || 0,
        byStatus: stats,
        dailyOrders,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Get order stats error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to get order statistics: " + error.message 
    });
  }
};