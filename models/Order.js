// const mongoose = require("mongoose");

// const trackingSchema = new mongoose.Schema(
//   {
//     status: {
//       type: String,
//       required: true,
//       enum: [
//         "Order Placed",
//         "Approved",
//         "Processing",
//         "Cutting Completed",
//         "Sewing Started",
//         "Finishing",
//         "QC Checked",
//         "Packed",
//         "Shipped",
//         "Out for Delivery",
//         "Delivered",
//         "Rejected",
//         "Cancelled",
//       ],
//     },
//     location: {
//       type: String,
//       required: true,
//     },
//     note: {
//       type: String,
//     },
//     timestamp: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { _id: false }
// );

// const orderSchema = new mongoose.Schema(
//   {
//     // 🔹 PRODUCT INFORMATION
//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product",
//       required: true,
//     },

//     // 🔹 BUYER INFORMATION
//     buyer: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     // 🔹 ORDER DETAILS
//     quantity: {
//       type: Number,
//       required: true,
//       min: 1,
//     },
//     unitPrice: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     totalAmount: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     // 🔹 SHIPPING INFORMATION
//     shippingAddress: {
//       type: String,
//       required: true,
//     },
//     phoneNumber: {
//       type: String,
//       required: true,
//     },
//     notes: {
//       type: String,
//       default: "",
//     },

//     // 🔹 PAYMENT INFORMATION
//     paymentMethod: {
//       type: String,
//       enum: ["cod", "payFirst"],
//       required: true,
//       default: "payFirst",
//     },
//     paymentStatus: {
//       type: String,
//       enum: ["pending", "paid", "failed"],
//       default: "pending",
//     },
//     stripeSessionId: {
//       type: String,
//     },

//     // 🔹 ORDER STATUS
//     status: {
//       type: String,
//       enum: [
//         "pending",
//         "processing",
//         "approved",
//         "shipped",
//         "delivered",
//         "cancelled",
//         "rejected",
//       ],
//       default: "pending",
//     },

//     // 🔹 TRACKING
//     tracking: [trackingSchema],
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Order", orderSchema);


const mongoose = require("mongoose");

const trackingSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: "System",
  },
  note: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const orderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
  // 🔥 Fixed: Valid enum values for paymentMethod
  paymentMethod: {
    type: String,
    enum: ["cod", "stripe", "payfast"], // ← এখানে তোমার gateway গুলো দাও
    default: "cod",
  },
  // Optional: payment type from product (cashOnDelivery, advancePayment, partialPayment)
  paymentType: {
    type: String,
    enum: ["cashOnDelivery", "advancePayment", "partialPayment"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "rejected",
    ],
    default: "pending",
  },
  tracking: [trackingSchema],
  stripeSessionId: String, // if using Stripe
  approvedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt on save
orderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Order", orderSchema);
