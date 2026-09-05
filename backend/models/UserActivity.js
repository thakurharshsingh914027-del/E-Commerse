const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    actionType: {
      type: String,
      enum: ["view", "cart", "purchase", "like"],
      required: true,
    },
    category: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.UserActivity || mongoose.model("UserActivity", userActivitySchema);
