require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const Razorpay = require("razorpay");

// Routes
const authRoute = require("./router/auth-router");
const contactRoute = require("./router/contact-router");
const productRoutes = require("./router/product-router");
const orderRoutes = require("./router/order-router"); // ✅ ADDED
const vendorRoutes = require("./router/vendor-router");//vender routes
const connectDB = require("./utils/db");
const errorMiddleware = require("./middlewares/error-middleware");
//admin route
const adminRoutes = require("./router/admin-router");
const recommendationRoutes = require("./router/recommendation-router");

// chat agent 
const chatRoutes = require("./router/chatRoutes");
const app = express();
// review route
const reviewRoutes = require("./router/review-routes");
/* ===============================
   INITIALIZATION
================================= */

const hasRazorpayConfig =
  Boolean(process.env.RAZORPAY_KEY_ID) && Boolean(process.env.RAZORPAY_KEY_SECRET);

const razorpay = hasRazorpayConfig
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID.trim(),
      key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
    })
  : null;

/* ===============================
   CORS CONFIGURATION
================================= */

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    return callback(null, true); // Allow configured and deployment origins
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
/* ===============================
   GLOBAL MIDDLEWARES
================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "E-Commerce Backend API is running!" });
});

/* ===============================
   RAZORPAY ROUTE
================================= */

app.post("/api/create-razorpay-order", async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: "Online payments are not configured on this server",
      });
    }

    const { amount } = req.body;

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create Razorpay order",
      error: error.message,
    });
  }
});

/* ===============================
   ROUTERS
================================= */

app.use("/api/auth", authRoute);
app.use("/api/form", contactRoute);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes); // ✅ THIS FIXES YOUR ISSUE
 // ✅ ADDED VENDOR ROUTES
app.use("/api/reviews", reviewRoutes); // <--- Line 87
app.use("/api/recommendations", recommendationRoutes);

/*admin route*/
app.use("/api/admin", adminRoutes);

// vendor routes
app.use("/api/vendor", vendorRoutes);
//chat agent route
app.use("/api/chatbot", chatRoutes);
// app.use("/api/chat", chatRoutes);
/* ===============================
   ERROR HANDLER
================================= */

app.use(errorMiddleware);

/* ===============================
   SERVER START
================================= */

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

// require('dotenv').config();
// const express = require('express');
// const cors = require("cors");

// const path = require('path');
// const Razorpay = require('razorpay');
// const crypto = require("crypto");

// // Middlewares & Routes
// const authRoute = require('./router/auth-router.js');
// const contactRoute = require('./router/contact-router.js');
// const productRoutes = require("./router/product-router");
// const connectDB = require('./utils/db');
// const errorMiddleware = require("./middlewares/error-middleware.js");

// const app = express();

// // --- INITIALIZATION ---
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID.trim(),
//   key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
// });

// const corsOptions = {
//   origin: "http://localhost:5173",
//   methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
//   credentials: true,
// };

// // --- GLOBAL MIDDLEWARES ---
// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // --- RAZORPAY API (Kept in index for simplicity) ---
// app.post("/api/create-razorpay-order", async (req, res) => {
//   try {
//     const { amount } = req.body;
//     const options = {
//       amount: Math.round(amount * 100),
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     };
//     const order = await razorpay.orders.create(options);
//     res.status(200).json(order);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create Razorpay order" });
//   }
// });

// // --- ROUTERS ---
// // This handles /api/auth/admin/stats, /api/auth/admin/users, etc.
// app.use('/api/auth', authRoute); 
// app.use('/api/form', contactRoute);
// app.use("/api/products", productRoutes);

// // --- ERROR HANDLING ---
// app.use(errorMiddleware);

// const PORT = 5000;
// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
// });
// require('dotenv').config();
// const express = require('express');
// const cors = require("cors");
// const path = require('path');
// const Razorpay = require('razorpay');
// const crypto = require("crypto");

// // Middlewares & Routes
// const authMiddleware = require("./middlewares/auth-middleware");
// const adminMiddleware = require("./middlewares/admin-middleware");
// const authRoute = require('./router/auth-router.js');
// const contactRoute = require('./router/contact-router.js');
// const productRoutes = require("./router/product-router");
// const connectDB = require('./utils/db');
// const errorMiddleware = require("./middlewares/error-middleware.js");

// // MODELS - Make sure these paths are correct!
// const Order = require("./models/order-model");
// const User = require("./models/user-model"); // Needed for countDocuments
// const Product = require("./models/product-model"); // Needed for countDocuments

// const app = express();

// // --- INITIALIZATION ---
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID.trim(),
//   key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
// });

// const corsOptions = {
//   origin: "http://localhost:5173",
//   methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
//   credentials: true,
// };

// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // --- 1. DASHBOARD STATS (FIXED POSITION) ---
// // Placing this BEFORE specific routers to ensure it catches the /api/admin/stats call
// // --- index.js ---

// // 1. FIRST: Define the specific admin stats route
// app.get("/api/admin/stats", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const userCount = await User.countDocuments(); 
//     const productCount = await Product.countDocuments();
//     const orderCount = await Order.countDocuments();

//     res.status(200).json({
//       users: userCount,
//       products: productCount,
//       orders: orderCount
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error" });
//   }
// });

// // 2. SECOND: Use your other routers
// app.use('/api/auth', authRoute);
// app.use('/api/products', productRoutes);
// // --- 2. RAZORPAY & ORDERS ---
// app.post("/api/create-razorpay-order", async (req, res) => {
//   try {
//     const { amount } = req.body;
//     const options = {
//       amount: Math.round(amount * 100),
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     };
//     const order = await razorpay.orders.create(options);
//     res.status(200).json(order);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create Razorpay order" });
//   }
// });

// app.post("/api/verify-payment", authMiddleware, async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, totalAmount, user } = req.body;
//     const sign = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign).digest("hex");

//     if (razorpay_signature === expectedSign) {
//       const newOrder = new Order({ user, items, totalAmount, paymentStatus: "Paid", razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id });
//       await newOrder.save();
//       res.status(200).json({ success: true, message: "Payment verified!" });
//     } else {
//       res.status(400).json({ success: false, message: "Invalid signature!" });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // --- 3. ADMIN & USER ORDER ROUTES ---
// app.get("/api/admin/orders", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const orders = await Order.find().sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.get("/api/user-orders/:identifier", async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.params.identifier }).sort({ createdAt: -1 });
//     res.status(200).json(orders);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch orders" });
//   }
// });

// // --- 4. ROUTERS ---
// app.use('/api/auth', authRoute);
// app.use('/api/form', contactRoute);
// app.use("/api/products", productRoutes);

// app.use(errorMiddleware);

// const PORT = 5000;
// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
// });
// require('dotenv').config();
// const express = require('express');
// const cors = require("cors");
// const path = require('path');
// const Razorpay = require('razorpay');
// const crypto = require("crypto");

// // Middlewares & Routes
// const authMiddleware = require("./middlewares/auth-middleware");
// const adminMiddleware = require("./middlewares/admin-middleware");
// const authRoute = require('./router/auth-router.js');
// const contactRoute = require('./router/contact-router.js');
// const productRoutes = require("./router/product-router");
// const connectDB = require('./utils/db');
// const errorMiddleware = require("./middlewares/error-middleware.js");

// // Models
// const Order = require("./models/order-model");

// const app = express();

// // --- INITIALIZATION ---

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID.trim(),
//   key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
// });

// const corsOptions = {
//   origin: "http://localhost:5173",
//   methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
//   credentials: true,
// };

// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // --- 1. RAZORPAY & ORDER CREATION ---

// app.post("/api/create-razorpay-order", async (req, res) => {
//   try {
//     const { amount } = req.body;
//     if (!amount) return res.status(400).json({ error: "Amount is required" });

//     const options = {
//       amount: Math.round(amount * 100), // Convert to Paise
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);
//     res.status(200).json(order);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create Razorpay order" });
//   }
// });

// app.post("/api/verify-payment", authMiddleware, async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, totalAmount, user } = req.body;
    
//     const sign = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSign = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(sign.toString())
//       .digest("hex");

//     if (razorpay_signature === expectedSign) {
//       const newOrder = new Order({ 
//         user, 
//         items, 
//         totalAmount, 
//         paymentStatus: "Paid", 
//         razorpayOrderId: razorpay_order_id, 
//         razorpayPaymentId: razorpay_payment_id 
//       });
//       await newOrder.save();
//       res.status(200).json({ success: true, message: "Payment verified!" });
//     } else {
//       res.status(400).json({ success: false, message: "Invalid signature!" });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// app.post("/api/place-cod-order", authMiddleware, async (req, res) => {
//   try {
//     const { user, items, totalAmount } = req.body;
//     const newOrder = new Order({ 
//       user, 
//       items, 
//       totalAmount, 
//       paymentStatus: "Pending", 
//       paymentMethod: "COD" 
//     });
//     await newOrder.save();
//     res.status(201).json({ success: true, message: "COD Order placed!" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // --- 2. USER PANEL ROUTES ---

// // Fetch orders by user identifier (Works with username or ID)
// app.get("/api/user-orders/:identifier", async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.params.identifier }).sort({ createdAt: -1 });
//     res.status(200).json(orders);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch orders" });
//   }
// });

// // User Cancel Order Route
// app.patch("/api/orders/:id/cancel", authMiddleware, async (req, res) => {
//   try {
//     const updatedOrder = await Order.findByIdAndUpdate(
//       req.params.id,
//       { $set: { status: "Cancelled" } },
//       { new: true }
//     );
//     if (!updatedOrder) return res.status(404).json({ success: false, message: "Order not found" });
//     res.status(200).json({ success: true, message: "Order cancelled successfully", order: updatedOrder });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // --- 3. ADMIN PANEL ROUTES ---

// app.get("/api/admin/orders", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     // We sort by newest first. Note: .populate only works if user is an ObjectId.
//     const orders = await Order.find().sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.put("/api/admin/orders/:id", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const { status } = req.body;
//     const updatedOrder = await Order.findByIdAndUpdate(
//       req.params.id,
//       { 
//         $set: { 
//           status: status, 
//           // If admin marks as Delivered, we assume it is Paid (for COD)
//           paymentStatus: status === "Delivered" ? "Paid" : "Pending" 
//         } 
//       },
//       { new: true, runValidators: true } 
//     );
//     if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
//     res.status(200).json(updatedOrder);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
// // In index.js
// app.get("/api/admin/stats", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     // These counts come directly from your MongoDB collections
//     const userCount = await User.countDocuments(); 
//     const productCount = await Product.countDocuments();
//     const orderCount = await Order.countDocuments();

//     res.status(200).json({
//       users: userCount,
//       products: productCount,
//       orders: orderCount
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error" });
//   }
// });

// // --- 4. ROUTERS ---
// app.use('/api/auth', authRoute);
// app.use('/api/form', contactRoute);
// app.use("/api/products", productRoutes);

// app.use(errorMiddleware);

// // --- 5. DATABASE & SERVER START ---
// const PORT = 5000;
// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
// });
// require('dotenv').config();
// const express = require('express');
// const cors = require("cors");
// const path = require('path');
// const Razorpay = require('razorpay');
// const crypto = require("crypto");

// // Middlewares & Routes
// const authMiddleware = require("./middlewares/auth-middleware");
// const adminMiddleware = require("./middlewares/admin-middleware");
// const authRoute = require('./router/auth-router.js');
// const contactRoute = require('./router/contact-router.js');
// const productRoutes = require("./router/product-router");
// const connectDB = require('./utils/db');
// const errorMiddleware = require("./middlewares/error-middleware.js");

// // Models
// const Order = require("./models/order-model");

// const app = express();

// // Initialize Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID.trim(),
//   key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
// });

// const corsOptions = {
//   origin: "http://localhost:5173",
//   methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
//   credentials: true,
// };

// // Middlewares
// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // --- 1. RAZORPAY & ORDER CREATION ---

// app.post("/api/create-razorpay-order", async (req, res) => {
//   try {
//     const { amount } = req.body;
//     if (!amount) return res.status(400).json({ error: "Amount is required" });

//     const options = {
//       amount: Math.round(amount * 100),
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);
//     res.status(200).json(order);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create Razorpay order" });
//   }
// });

// app.post("/api/verify-payment", authMiddleware, async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, totalAmount, user } = req.body;
//     const sign = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign).digest("hex");

//     if (razorpay_signature === expectedSign) {
//       const newOrder = new Order({ user, items, totalAmount, paymentStatus: "Paid", razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id });
//       await newOrder.save();
//       res.status(200).json({ success: true, message: "Payment verified!" });
//     } else {
//       res.status(400).json({ success: false, message: "Invalid signature!" });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// app.post("/api/place-cod-order", authMiddleware, async (req, res) => {
//   try {
//     const { user, items, totalAmount } = req.body;
//     const newOrder = new Order({ user, items, totalAmount, paymentStatus: "Pending", paymentMethod: "COD" });
//     await newOrder.save();
//     res.status(201).json({ success: true, message: "COD Order placed!" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // --- 2. USER PANEL ROUTES ---

// // Fetch orders by user identifier (Works with username or ID)
// app.get("/api/user-orders/:identifier", async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.params.identifier }).sort({ createdAt: -1 });
//     res.status(200).json(orders);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch orders" });
//   }
// });

// // User Cancel Order Route (The missing route causing the HTML error)
// app.patch("/api/orders/:id/cancel", authMiddleware, async (req, res) => {
//   try {
//     const updatedOrder = await Order.findByIdAndUpdate(
//       req.params.id,
//       { $set: { status: "Cancelled" } },
//       { new: true }
//     );
//     if (!updatedOrder) return res.status(404).json({ success: false, message: "Order not found" });
//     res.status(200).json({ success: true, message: "Order cancelled successfully", order: updatedOrder });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // --- 3. ADMIN PANEL ROUTES ---

// app.get("/api/admin/orders", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const orders = await Order.find().populate("user", "email");
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.put("/api/admin/orders/:id", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const { status } = req.body;
//     const updatedOrder = await Order.findByIdAndUpdate(
//       req.params.id,
//       { 
//         $set: { 
//           status: status, 
//           paymentStatus: status === "Delivered" ? "Paid" : "Pending" 
//         } 
//       },
//       { new: true, runValidators: true } 
//     );
//     if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
//     res.status(200).json(updatedOrder);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // --- 4. ROUTERS ---
// app.use('/api/auth', authRoute);
// app.use('/api/form', contactRoute);
// app.use("/api/products", productRoutes);

// app.use(errorMiddleware);

// const PORT = 5000;
// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
// });
// require('dotenv').config();
// const express = require('express');
// const cors = require("cors");
// const path = require('path');
// const Razorpay = require('razorpay');
// const crypto = require("crypto");

// // Middlewares & Routes
// const authMiddleware = require("./middlewares/auth-middleware");
// const adminMiddleware = require("./middlewares/admin-middleware");
// const authRoute = require('./router/auth-router.js');
// const contactRoute = require('./router/contact-router.js');
// const productRoutes = require("./router/product-router");
// const connectDB = require('./utils/db');
// const errorMiddleware = require("./middlewares/error-middleware.js");

// // Models
// const Order = require("./models/order-model");

// const app = express();

// // Initialize Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID.trim(),
//   key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
// });

// const corsOptions = {
//   origin: "http://localhost:5173",
//   methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
//   credentials: true,
// };

// // Middlewares
// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // --- 1. RAZORPAY & ORDER CREATION ---

// app.post("/api/create-razorpay-order", async (req, res) => {
//   try {
//     const { amount } = req.body;
//     if (!amount) return res.status(400).json({ error: "Amount is required" });

//     const options = {
//       amount: Math.round(amount * 100),
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);
//     res.status(200).json(order);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to create Razorpay order" });
//   }
// });

// app.post("/api/verify-payment", authMiddleware, async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, totalAmount, user } = req.body;
//     const sign = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign).digest("hex");

//     if (razorpay_signature === expectedSign) {
//       const newOrder = new Order({ user, items, totalAmount, paymentStatus: "Paid", razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id });
//       await newOrder.save();
//       res.status(200).json({ success: true, message: "Payment verified!" });
//     } else {
//       res.status(400).json({ success: false, message: "Invalid signature!" });
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// app.post("/api/place-cod-order", authMiddleware, async (req, res) => {
//   try {
//     const { user, items, totalAmount } = req.body;
//     const newOrder = new Order({ user, items, totalAmount, paymentStatus: "Pending", paymentMethod: "COD" });
//     await newOrder.save();
//     res.status(201).json({ success: true, message: "COD Order placed!" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // --- 2. USER PANEL ROUTES ---

// // FIX: Changed from :username to :userId to ensure we fetch by ID stored in DB
// app.get("/api/user-orders/:userId", async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
//     res.status(200).json(orders);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch orders" });
//   }
// });

// // --- 3. ADMIN PANEL ROUTES (Now explicitly outside /auth prefix) ---

// // Get All Orders for Admin
// app.get("/api/admin/orders", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const orders = await Order.find().populate("user", "email");
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Update Order Status (THE FIX)
// app.put("/api/admin/orders/:id", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const { status } = req.body; // "Delivered"

//     const updatedOrder = await Order.findByIdAndUpdate(
//       req.params.id,
//       { 
//         $set: { 
//           status: status, 
//           // Automatically mark as Paid if the admin sets it to Delivered
//           paymentStatus: status === "Delivered" ? "Paid" : "Pending" 
//         } 
//       },
//       { new: true, runValidators: true } 
//     );

//     if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
//     res.status(200).json(updatedOrder);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
// // --- 4. ROUTERS ---
// app.use('/api/auth', authRoute);
// app.use('/api/form', contactRoute);
// app.use("/api/products", productRoutes);

// app.use(errorMiddleware);

// const PORT = 5000;
// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
// });
// require('dotenv').config();
// const authMiddleware = require("./middlewares/auth-middleware");

// const express = require('express');
// const cors = require("cors");
// const path = require('path');
// const Razorpay = require('razorpay');
// const crypto = require("crypto"); // Needed for payment verification

// const authRoute = require('./router/auth-router.js');
// const contactRoute = require('./router/contact-router.js');
// const productRoutes = require("./router/product-router");
// const connectDB = require('./utils/db');
// const errorMiddleware = require("./middlewares/error-middleware.js");
// const Order = require("./models/order-model");

// const app = express();

// // Initialize Razorpay
// // NOTE: If this fails with 401, double-check your .env keys
// const razorpay = new Razorpay({
//   // .trim() is mandatory to remove that invisible space from your .env
//   key_id: process.env.RAZORPAY_KEY_ID.trim(),
//   key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
// });
// const corsOptions = {
//   origin: "http://localhost:5173",
//   methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
//   credentials: true,
// };

// // Middlewares
// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // --- 1. RAZORPAY: CREATE ORDER ---
// app.post("/api/create-razorpay-order",async (req, res) => {
//   try {
//     const { amount } = req.body; 
//     if (!amount) return res.status(400).json({ error: "Amount is required" });

//     const options = {
//       amount: Math.round(amount * 100), // Convert INR to Paise
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);
//     res.status(200).json(order); 
//   } catch (error) {
//     console.error("RAZORPAY ORDER ERROR:", error);
//     res.status(error.statusCode || 500).json({ 
//       error: error.error ? error.error.description : "Failed to create order",
//       code: error.error ? error.error.code : "AUTH_OR_INTERNAL_ERROR"
//     });
//   }
// });

// // --- 2. RAZORPAY: VERIFY PAYMENT & SAVE TO DB ---
// app.post("/api/verify-payment",authMiddleware, async (req, res) => {
//   try {
//     const { 
//       razorpay_order_id, 
//       razorpay_payment_id, 
//       razorpay_signature, 
//       items, 
//       totalAmount, 
//       user 
//     } = req.body;

//     // Create the signature verification string
//     const sign = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSign = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(sign.toString())
//       .digest("hex");

//     if (razorpay_signature === expectedSign) {
//       // Payment is authentic - Save to Database
//       const newOrder = new Order({
//         user,
//         items,
//         totalAmount,
//         paymentStatus: "Paid", // Mark as paid for online payments
//         razorpayOrderId: razorpay_order_id,
//         razorpayPaymentId: razorpay_payment_id
//       });

//       await newOrder.save();
//       res.status(200).json({ success: true, message: "Payment verified and order saved!" });
//     } else {
//       res.status(400).json({ success: false, message: "Invalid payment signature!" });
//     }
//   } catch (error) {
//     console.error("VERIFICATION ERROR:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // --- 3. CASH ON DELIVERY ORDER ---
// app.post("/api/place-cod-order",authMiddleware, async (req, res) => {
//   try {
//     const { user, items, totalAmount } = req.body;
//     const newOrder = new Order({
//       user,
//       items,
//       totalAmount,
//       paymentStatus: "Pending", // For COD
//       paymentMethod: "COD"
//     });
//     await newOrder.save();
//     res.status(201).json({ success: true, message: "COD Order placed successfully!" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // --- 4. ORDER MANAGEMENT (Cancel/Fetch) ---
// app.patch("/api/orders/:id/cancel", async (req, res) => {
//   try {
//     const updatedOrder = await Order.findByIdAndUpdate(
//       req.params.id,
//       { status: "Cancelled" },
//       { new: true }
//     );
//     if (!updatedOrder) return res.status(404).json({ success: false, message: "Order not found" });
//     res.status(200).json({ success: true, message: "Order cancelled", order: updatedOrder });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// app.get("/api/user-orders/:username", async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.params.username }).sort({ createdAt: -1 });
//     res.status(200).json(orders);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch orders" });
//   }
// });

// // Use Routers
// app.use('/api/auth', authRoute);
// app.use('/api/form', contactRoute);
// app.use("/api/products", productRoutes);

// // Global Error Middleware
// app.use(errorMiddleware);

// // Server Connection
// const PORT = 5000;
// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//     console.log("-----------------------------------------");
//     console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID ? "LOADED" : "MISSING ❌");
//     console.log("Razorpay Secret:", process.env.RAZORPAY_KEY_SECRET ? "LOADED" : "MISSING ❌");
//     console.log("-----------------------------------------");
//   });
// });
// require('dotenv').config();
// const express = require('express');
// const cors = require("cors");
// const path = require('path');
// const Razorpay = require('razorpay');
// const app = express();

// // Initialize Razorpay
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// const authRoute = require('./router/auth-router.js');
// const contactRoute = require('./router/contact-router.js');
// const productRoutes = require("./router/product-router");
// const connectDB = require('./utils/db');
// const errorMiddleware = require("./middlewares/error-middleware.js");
// const Order = require("./models/order-model");
// const corsOptions = {
//   origin: "http://localhost:5173",
//   methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
//   credentials: true,
// };

// app.use(cors(corsOptions));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // --- RAZORPAY ORDER ROUTE ---
// // --- RAZORPAY ORDER ROUTE ---
// app.post("/api/create-razorpay-order", async (req, res) => {
//   try {
//     const { amount } = req.body; 
//     if (!amount) return res.status(400).json({ error: "Amount is required" });

//     const options = {
//       amount: Math.round(amount * 100), 
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);
//     res.status(200).json(order); // Success
//   } catch (error) {
//     console.error("RAZORPAY ERROR:", error);
//     // Send the error details so frontend doesn't get "null"
//     res.status(error.statusCode || 500).json({ 
//       error: error.error ? error.error.description : "Failed to create order",
//       code: error.error ? error.error.code : "INTERNAL_ERROR"
//     });
//   }
// });
// // --- CASH ON DELIVERY ORDER ROUTE ---
// app.post("/api/place-cod-order", async (req, res) => {
//   try {
//     const { user, items, totalAmount } = req.body;

//     const newOrder = new Order({
//       user,
//       items,
//       totalAmount,
//     });

//     await newOrder.save();
//     res.status(201).json({ success: true, message: "Order placed successfully!" });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });
// // cancle order 
// app.patch("/api/orders/:id/cancel", async (req, res) => {
//   try {
//     const orderId = req.params.id;
//     // Find order and update status to Cancelled
//     const updatedOrder = await Order.findByIdAndUpdate(
//       orderId,
//       { status: "Cancelled" },
//       { new: true }
//     );

//     if (!updatedOrder) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     res.status(200).json({ success: true, message: "Order cancelled", order: updatedOrder });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });
// // Routes
// app.use('/api/auth', authRoute);
// app.use('/api/form', contactRoute);
// app.use("/api/products", productRoutes);

// app.use(errorMiddleware);
// // Add this route to your server.js
// app.get("/api/user-orders/:username", async (req, res) => {
//   try {
//     const { username } = req.params;
//     // Find all orders where the 'user' field matches the username
//     const orders = await Order.find({ user: username }).sort({ createdAt: -1 });
    
//     res.status(200).json(orders);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch orders" });
//   }
// });
// const PORT = 5000;
// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
//   console.log("Razorpay Key Loaded:", process.env.RAZORPAY_KEY_ID ? "Yes" : "No");
// console.log("DB URI:", process.env.MONGODB_URI);
// });
// require('dotenv').config();
// const express = require('express');
// const cors = require("cors");
// const path = require('path'); // Added for static file handling
// const app = express();

// const authRoute = require('./router/auth-router.js');
// const contactRoute = require('./router/contact-router.js');
// const productRoutes = require("./router/product-router"); // Consolidated here
// const connectDB = require('./utils/db');
// const errorMiddleware = require("./middlewares/error-middleware.js");
// //payment
// const stripe = require("stripe")("your_stripe_secret_key_here");
// // CORS configuration
// const corsOptions = {
//   origin: "http://localhost:5173",
//   methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
//   credentials: true,
// };

// app.use(cors(corsOptions));

// // ✅ Body parsers
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ✅ STATIC FILE SERVICING (The missing piece for your images)
// // This makes the 'uploads' folder public so your React app can see the images
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // ✅ API Routes
// app.use('/api/auth', authRoute);
// app.use('/api/form', contactRoute);
// app.use("/api/products", productRoutes);

// // ✅ Error middleware (Must be last)
// app.use(errorMiddleware);

// const PORT = 5000;

// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
//     console.log(`Static files being served from: ${path.join(__dirname, 'uploads')}`);
//   });
// });
// require('dotenv').config();
// const express = require('express');
// const cors = require("cors");
// const app = express();

// const authRoute = require('./router/auth-router.js');
// const contactRoute = require('./router/contact-router.js');
// const connectDB = require('./utils/db');
// const errorMiddleware = require("./middlewares/error-middleware.js");
// // const authRoutes = require ("./routes/authRoutes.js");
//   // let tacle cors
// const corsOptions ={
//   origin: "http://localhost:5173",
//   methods:"GET, POST, PUT, DELETE , PATCH , HEAD",
//   credential : true,
// }

//   app.use(cors(corsOptions));

// // ✅ Body parsers FIRST
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ✅ Routes
// app.use('/api/auth', authRoute);
// app.use('/api/form', contactRoute);

// // ✅ Error middleware LAST
// app.use(errorMiddleware);
// // admin auth routes
// const authRoutes = require("./router/auth-router.js");

// app.use("/api/auth", authRoutes);

// //add product route
// const productRoutes = require("./router/product-router");

// app.use("/api/products", productRoutes);


// const PORT = 5000;

// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
//   });
// });
