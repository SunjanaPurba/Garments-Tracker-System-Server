const Product = require("../models/Product");
const mongoose = require("mongoose");

// Helper functions
const buildFilter = (query) => {
  const { q, category, minPrice, maxPrice, inStock } = query;
  const filter = {};

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
    ];
  }

  if (category && category !== "all") {
    filter.category = category;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  if (inStock === "true") {
    filter.quantity = { $gt: 0 };
  } else if (inStock === "false") {
    filter.quantity = 0;
  }

  return filter;
};

// 🔹 Get all products (pagination + search)
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const q = req.query.q || "";
    const category = req.query.category || "";
    const inStock = req.query.inStock;
    const sort = req.query.sort || "-createdAt";

    // Build filter
    const filter = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }
    if (category && category !== "all") {
      filter.category = category;
    }
    if (inStock === "true") {
      filter.quantity = { $gt: 0 };
    } else if (inStock === "false") {
      filter.quantity = 0;
    }

    const skip = (page - 1) * limit;

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === "priceLow") {
      sortOption = { price: 1 };
    } else if (sort === "priceHigh") {
      sortOption = { price: -1 };
    } else if (sort === "quantityHigh") {
      sortOption = { quantity: -1 };
    } else if (sort === "quantityLow") {
      sortOption = { quantity: 1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    // Get products
    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sortOption)
      .populate("createdBy", "name email");

    // Get total count
    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// 🔹 Home products
exports.getHomeProducts = async (req, res) => {
  try {
    const products = await Product.find({
      showOnHome: true,
      quantity: { $gt: 0 },
    })
      .limit(6)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (err) {
    console.error("Get home products error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch home products",
    });
  }
};

// 🔹 Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID",
      });
    }

    const product = await Product.findById(id).populate(
      "createdBy",
      "name email"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (err) {
    console.error("Get product by ID error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// 🔹 Get related products
exports.getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const products = await Product.find({
      _id: { $ne: id },
      category: category,
      quantity: { $gt: 0 },
    })
      .limit(4)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    res.json({
      success: true,
      products,
    });
  } catch (err) {
    console.error("Get related products error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch related products",
    });
  }
};

// 🔹 Toggle wishlist
exports.toggleWishlist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if already wishlisted
    const isWishlisted = product.wishlistedBy?.includes(userId);

    if (isWishlisted) {
      // Remove from wishlist
      product.wishlistedBy = product.wishlistedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Add to wishlist
      if (!product.wishlistedBy) product.wishlistedBy = [];
      product.wishlistedBy.push(userId);
    }

    await product.save();

    res.json({
      success: true,
      isWishlisted: !isWishlisted,
      message: !isWishlisted ? "Added to wishlist" : "Removed from wishlist",
    });
  } catch (err) {
    console.error("Wishlist toggle error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update wishlist",
    });
  }
};

// 🔹 Get wishlisted products
exports.getWishlistedProducts = async (req, res) => {
  try {
    const userId = req.user._id;

    const products = await Product.find({ wishlistedBy: userId })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    res.json({
      success: true,
      products,
    });
  } catch (err) {
    console.error("Get wishlisted products error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlisted products",
    });
  }
};

// 🔹 Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    if (!["shirt", "pant", "jacket", "accessories"].includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    const filter = { category };
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate("createdBy", "name email"),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      category,
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Get products by category error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products by category",
    });
  }
};

// 🔹 Get popular products
exports.getPopularProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const products = await Product.find({ quantity: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("createdBy", "name email");

    res.json({
      success: true,
      products,
    });
  } catch (err) {
    console.error("Get popular products error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch popular products",
    });
  }
};

// 🔹 Update product quantity
exports.updateProductQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.quantity = quantity;
    await product.save();

    res.json({
      success: true,
      product,
      message: "Quantity updated successfully",
    });
  } catch (err) {
    console.error("Update product quantity error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update product quantity",
    });
  }
};

// 🔹 Get product statistics
exports.getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$price", "$quantity"] } },
          avgPrice: { $avg: "$price" },
          totalInStock: { $sum: "$quantity" },
        },
      },
    ]);

    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    res.json({
      success: true,
      stats: stats[0] || {},
      categoryStats,
    });
  } catch (err) {
    console.error("Get product stats error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product statistics",
    });
  }
};

// 🔹 Admin - Get all products
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (err) {
    console.error("Get all products admin error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// 🔹 Create product
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category, quantity, minOrder } =
      req.body;

    // Validate required fields
    if (!title || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description, price, and category are required",
      });
    }

    const product = new Product({
      ...req.body,
      createdBy: req.user._id,
    });

    await product.save();

    res.status(201).json({
      success: true,
      product,
      message: "Product created successfully",
    });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

// 🔹 Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user is authorized
    if (
      req.user.role !== "admin" &&
      product.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this product",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("createdBy", "name email");

    res.json({
      success: true,
      product: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

// 🔹 Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check authorization
    if (
      req.user.role !== "admin" &&
      product.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this product",
      });
    }

    await Product.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

// 🔹 Toggle show on home
exports.toggleShowOnHome = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.showOnHome = !product.showOnHome;
    await product.save();

    res.json({
      success: true,
      product,
      message: product.showOnHome
        ? "Product added to home page"
        : "Product removed from home page",
    });
  } catch (err) {
    console.error("Toggle show on home error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

// 🔹 Get manager products
exports.getManagerProducts = async (req, res) => {
  try {
    const products = await Product.find({ createdBy: req.user._id })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (err) {
    console.error("Get manager products error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch manager products",
    });
  }
};

// 🔹 Get out of stock products (NEW)
exports.getOutOfStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ quantity: 0 })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
      count: products.length,
    });
  } catch (err) {
    console.error("Get out of stock products error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch out of stock products",
    });
  }
};

// 🔹 Bulk update all products quantity (NEW)
exports.bulkUpdateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const result = await Product.updateMany(
      {},
      { $set: { quantity: quantity || 100 } }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} products with quantity ${quantity}`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Bulk update quantity error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update products",
    });
  }
};
