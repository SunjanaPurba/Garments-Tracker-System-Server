const express = require('express');
const router = express.Router();

// Models
const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * @route   GET /api/dashboard/stats
 * @desc    Dashboard statistics
 * @access  Public (later admin protected)
 */
router.get('/stats', async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    res.json({
      success: true,
      totalProducts,
      totalOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
