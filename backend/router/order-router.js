const express = require("express");
const router = express.Router();

const {
  createRazorpayOrder,
  verifyPayment,
  placeCODOrder,
  getMyOrders,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/order-controller");

const authMiddleware = require("../middlewares/auth-middleware");
const adminMiddleware = require("../middlewares/admin-middleware");

// ================= USER ROUTES =================

// Razorpay
router.post("/create-razorpay-order", authMiddleware, createRazorpayOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);

// COD
router.post("/place-cod-order", authMiddleware, placeCODOrder);

// My Orders
router.get("/my", authMiddleware, getMyOrders);
router.patch("/:id/cancel", authMiddleware, cancelOrder);

// ================= ADMIN ROUTES =================
router.get("/", authMiddleware, adminMiddleware, getAllOrders);
router.put("/:id", authMiddleware, adminMiddleware, updateOrderStatus);

// // Get all orders
// router.get("/orders", authMiddleware, adminMiddleware, getAllOrders);

// // Update order status
// router.put("/orders/:id", authMiddleware, adminMiddleware, updateOrderStatus);

module.exports = router;

// const express = require("express");
// const router = express.Router();

// const {
//   createRazorpayOrder,
//   verifyPayment,
//   placeCODOrder,
//   getMyOrders,
//   cancelOrder,
//   getAllOrders,
//   updateOrderStatus
// } = require("../controllers/order-controller");

// const authMiddleware = require("../middlewares/auth-middleware");

// // Razorpay order
// router.post("/create-razorpay-order", authMiddleware, createRazorpayOrder);

// // Verify payment
// router.post("/verify-payment", authMiddleware, verifyPayment);

// // COD order
// router.post("/place-cod-order", authMiddleware, placeCODOrder);

// // Get my orders
// router.get("/my-orders", authMiddleware, getMyOrders);
// //my-order cancle
// router.patch("/:id/cancel", authMiddleware, cancelOrder);
// // Get all orders (Admin)
// router.get("/orders", authMiddleware, getAllOrders);

// // Update order status (Admin)
// router.put("/orders/:id", authMiddleware, updateOrderStatus);

// module.exports = router;
