const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ["shirt", "pant", "jacket", "accessories"],
      default: "shirt",
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 100, // ✅ Changed from 0 to 100
    },
    minOrder: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    images: [
      {
        type: String,
      },
    ],
    video: {
      type: String,
    },
    paymentOptions: {
      type: String,
      enum: ["cashOnDelivery", "payFirst"],
      default: "payFirst",
    },
    showOnHome: {
      type: Boolean,
      default: false,
    },
    wishlistedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
productSchema.index({ title: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ showOnHome: 1 });
productSchema.index({ createdBy: 1 });
productSchema.index({ quantity: 1 }); // For stock queries

module.exports = mongoose.model("Product", productSchema);
