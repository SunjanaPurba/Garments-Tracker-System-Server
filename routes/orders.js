// routes/orders.js (সম্পূর্ণ আপডেটেড)
const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const requireAdmin = require("../middlewares/requireAdmin");
const requireManager = require("../middlewares/requireManager");
const orderController = require("../controllers/orderController");

const router = express.Router();


router.post("/", verifyToken, orderController.createOrder);


router.get("/my-orders", verifyToken, orderController.getMyOrders);


router.get("/admin", verifyToken, requireAdmin, orderController.getAllOrders);
router.get(
  "/admin/stats",
  verifyToken,
  requireAdmin,
  orderController.getOrderStats
);

router.get(
  "/pending",
  verifyToken,
  requireManager,
  orderController.getPendingOrders
);
router.get(
  "/approved",
  verifyToken,
  requireManager,
  orderController.getApprovedOrders
);
router.put(
  "/:id/approve",
  verifyToken,
  requireManager,
  orderController.approveOrder
);
router.put(
  "/:id/reject",
  verifyToken,
  requireManager,
  orderController.rejectOrder
);
router.post(
  "/:id/tracking",
  verifyToken,
  requireManager,
  orderController.addTracking
);
router.put(
  "/:id/status",
  verifyToken,
  requireManager,
  orderController.updateOrderStatus
);


router.put("/:id/cancel", verifyToken, orderController.cancelOrder);

router.get("/:id", verifyToken, orderController.getOrderById);

module.exports = router;
