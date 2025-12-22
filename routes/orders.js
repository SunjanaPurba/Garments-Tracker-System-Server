// // routes/orders.js (সম্পূর্ণ আপডেটেড)
// const express = require("express");
// const verifyToken = require("../middlewares/verifyToken");
// const requireAdmin = require("../middlewares/requireAdmin");
// const requireManager = require("../middlewares/requireManager");
// const orderController = require("../controllers/orderController");

// const router = express.Router();


// router.post("/", verifyToken, orderController.createOrder);


// router.get("/my-orders", verifyToken, orderController.getMyOrders);


// router.get("/admin", verifyToken, requireAdmin, orderController.getAllOrders);
// router.get(
//   "/admin/stats",
//   verifyToken,
//   requireAdmin,
//   orderController.getOrderStats
// );

// router.get(
//   "/pending",
//   verifyToken,
//   requireManager,
//   orderController.getPendingOrders
// );
// router.get(
//   "/approved",
//   verifyToken,
//   requireManager,
//   orderController.getApprovedOrders
// );
// router.put(
//   "/:id/approve",
//   verifyToken,
//   requireManager,
//   orderController.approveOrder
// );
// router.put(
//   "/:id/reject",
//   verifyToken,
//   requireManager,
//   orderController.rejectOrder
// );
// router.post(
//   "/:id/tracking",
//   verifyToken,
//   requireManager,
//   orderController.addTracking
// );
// router.put(
//   "/:id/status",
//   verifyToken,
//   requireManager,
//   orderController.updateOrderStatus
// );


// router.put("/:id/cancel", verifyToken, orderController.cancelOrder);

// router.get("/:id", verifyToken, orderController.getOrderById);

// module.exports = router;


const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const requireAdmin = require("../middlewares/requireAdmin");
const requireManager = require("../middlewares/requireManager");

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getPendingOrders,
  getApprovedOrders,
  approveOrder,
  rejectOrder,
  addTracking,
  cancelOrder,
  getOrderById,
  updateOrderStatus,
  getOrderStats, // ✅ এখন এই function আছে
} = require("../controllers/orderController");

const router = express.Router();

// ===========================
// Buyer Routes
// ===========================
router.post("/", verifyToken, createOrder);                    // Order place
router.get("/my-orders", verifyToken, getMyOrders);            // User's own orders
router.get("/:id", verifyToken, getOrderById);                 // Single order details
router.put("/:id/cancel", verifyToken, cancelOrder);           // Cancel pending order

// ===========================
// Admin Routes
// ===========================
router.get("/admin/all", verifyToken, requireAdmin, getAllOrders); // All orders with pagination
router.get("/admin/stats", verifyToken, requireAdmin, getOrderStats); // Order statistics

// ===========================
// Manager Routes
// ===========================
router.get("/manager/pending", verifyToken, requireManager, getPendingOrders);
router.get("/manager/approved", verifyToken, requireManager, getApprovedOrders);
router.put("/:id/approve", verifyToken, requireManager, approveOrder);
router.put("/:id/reject", verifyToken, requireManager, rejectOrder);
router.post("/:id/tracking", verifyToken, requireManager, addTracking);
router.put("/:id/status", verifyToken, requireManager, updateOrderStatus);

module.exports = router;