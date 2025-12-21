const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const {
  syncUser,
  getMe,
  getAllUsers,
  updateUserRole,
  searchUsers,
} = require("../controllers/userController");

const router = express.Router();

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// PUBLIC - no verifyToken
router.put("/", syncUser);

// PROTECTED
router.get("/me", verifyToken, getMe);
router.get("/", verifyToken, requireAdmin, getAllUsers);
router.put("/:id", verifyToken, requireAdmin, updateUserRole);
router.get("/search", verifyToken, requireAdmin, searchUsers);

module.exports = router;
