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
  getOrderStats
} = require("../controllers/orderController");

const router = express.Router();

// ========================
// BUYER ROUTES
// ========================
router.post("/", verifyToken, createOrder);                    // Create new order
router.get("/my-orders", verifyToken, getMyOrders);            // Get user's orders
router.get("/:id", verifyToken, getOrderById);                 // Get single order
router.put("/:id/cancel", verifyToken, cancelOrder);           // Cancel order

// ========================
// ADMIN ROUTES
// ========================
router.get("/admin/all", verifyToken, requireAdmin, getAllOrders);
router.get("/admin/stats", verifyToken, requireAdmin, getOrderStats);

// ========================
// MANAGER ROUTES
// ========================
router.get("/manager/pending", verifyToken, requireManager, getPendingOrders);
router.get("/manager/approved", verifyToken, requireManager, getApprovedOrders);
router.put("/manager/:id/approve", verifyToken, requireManager, approveOrder);
router.put("/manager/:id/reject", verifyToken, requireManager, rejectOrder);
router.post("/manager/:id/tracking", verifyToken, requireManager, addTracking);
router.put("/manager/:id/status", verifyToken, requireManager, updateOrderStatus);

module.exports = router;