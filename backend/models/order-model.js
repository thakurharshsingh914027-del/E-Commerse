const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Detailed item list for multi-vendor support
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Or "Vendor" if you have a separate collection
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String }, // Useful for showing order history without population
      },
    ],

    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true },
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    // Tracking the lifecycle of the order
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    // Payment tracking
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    paymentMethod: {
      type: String,
      enum: ["Online", "COD"],
      required: true,
    },

    // Razorpay Integration Fields
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    // Helpful for analytics/customer support
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

// Optional: Virtual to calculate total quantity of items in an order
orderSchema.virtual('totalQuantity').get(function() {
  return this.items.reduce((acc, item) => acc + item.quantity, 0);
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     items: [
//       {
//         product: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true,
//         },
//         vendor: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "User",
//           required: true,
//         },
//         name: String,
//         price: Number,
//         quantity: Number,
//       },
//     ],

//     totalAmount: {
//       type: Number,
//       required: true,
//     },

//     status: {
//       type: String,
//       enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
//       default: "Pending",
//     },

//     paymentStatus: {
//       type: String,
//       enum: ["Pending", "Paid", "Failed"],
//       default: "Pending",
//     },

//     paymentMethod: {
//       type: String,
//       enum: ["Online", "COD"],
//       required: true,
//     },

//     razorpayOrderId: String,
//     razorpayPaymentId: String,
//   },
//   { timestamps: true }
// );

// module.exports =
//   mongoose.models.Order ||
//   mongoose.model("Order", orderSchema);
