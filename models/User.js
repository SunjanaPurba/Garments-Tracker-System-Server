const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: String,
    photoURL: String,
    role: {
      type: String,
      enum: ["buyer", "manager", "admin"],
      default: "buyer",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: "pending",
    },
    suspendReason: String,
    suspendFeedback: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
