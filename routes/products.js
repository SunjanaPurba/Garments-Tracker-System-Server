

const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Import auth middleware
const { authenticate, authorize } = require("../middlewares/auth");

// 🔹 Public Routes (No authentication required)
router.get("/", productController.getProducts);
router.get("/home", productController.getHomeProducts);
router.get("/popular", productController.getPopularProducts);
router.get("/stats", productController.getProductStats);
router.get("/category/:category", productController.getProductsByCategory);
router.get("/:id", productController.getProductById);
router.get("/:id/related", productController.getRelatedProducts);

// 🔹 Protected Routes (Authentication required)
router.post("/:id/wishlist", authenticate, productController.toggleWishlist);
router.get("/wishlist/my", authenticate, productController.getWishlistedProducts);
router.patch("/:id/quantity", authenticate, productController.updateProductQuantity);

// 🔹 Manager Routes
router.get("/manager/my-products", authenticate, authorize(["manager", "admin"]), productController.getManagerProducts);
router.post("/", authenticate, authorize(["manager", "admin"]), productController.createProduct);
router.put("/:id", authenticate, authorize(["manager", "admin"]), productController.updateProduct);
router.patch("/:id/toggle-home", authenticate, authorize(["manager", "admin"]), productController.toggleShowOnHome);

// 🔹 Admin Routes
router.get("/admin/all", authenticate, authorize(["admin"]), productController.getAllProductsAdmin);
router.get("/admin/out-of-stock", authenticate, authorize(["admin", "manager"]), productController.getOutOfStockProducts);
router.post("/admin/bulk-update-quantity", authenticate, authorize(["admin"]), productController.bulkUpdateQuantity);
router.delete("/:id", authenticate, authorize(["admin", "manager"]), productController.deleteProduct);

module.exports = router;