const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// ================= CONTROLLERS =================
const {
  home,
  register,
  login,
  getLoggedInUser,
  getAllVendors,
  updateVendorStatus,
  deleteVendor,
} = require("../controllers/auth-controller");

const {
  createRazorpayOrder,
  verifyPayment,
  placeCODOrder,
} = require("../controllers/order-controller");

// ================= MIDDLEWARE =================
const authMiddleware = require("../middlewares/auth-middleware");
const adminMiddleware = require("../middlewares/admin-middleware");

// ================= MODELS =================
const User = require("../models/user-model");
const Order = require("../models/order-model");
const Product = require("../models/product");
const Category = require("../models/category");

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ===================================================
// ================= PUBLIC ROUTES ===================
// ===================================================

router.get("/", home);
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getLoggedInUser);
// router/auth-router.js

// In your auth-router.js file

router.patch("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { username, phone } = req.body;
    
    // req.user is populated by your authMiddleware
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          username: username, 
          phone: phone 
        } 
      },
      { 
        new: true,           // Return the modified document
        runValidators: true  // Ensure schema rules are followed
      }
    ).select("-password");   // Never send the password back

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
    
  } catch (error) {
    console.error("Backend Update Error:", error);
    res.status(500).json({ message: "Server error during update" });
  }
});

// ---------- Get All Products (Customer View) ----------
// 
// ---------- Get All Products (Customer View) ----------
router.get("/all-products", async (req, res) => {
  try {
    const products = await Product.find()
      // Only populate if your Schema uses ObjectIds for these fields
      // .populate("category") 
      .populate("vendor", "username");
      
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
});

// ===================================================
// ================= PAYMENT ROUTES ==================
// ===================================================

router.post("/create-razorpay-order", authMiddleware, createRazorpayOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);
router.post("/place-cod-order", authMiddleware, placeCODOrder);

// ===================================================
// ================= ADMIN ROUTES ====================
// ===================================================

// Apply protection to all routes in this file


// ---------- Vendor Management ----------
router.get("/admin/vendors", authMiddleware, adminMiddleware, getAllVendors);
router.put("/admin/vendors/:id", authMiddleware, adminMiddleware, updateVendorStatus);
router.delete("/admin/vendors/:id", authMiddleware, adminMiddleware, deleteVendor);
module.exports = router;

// ---------- Assign Category To Vendor ----------


// // ===================================================
// // ================= VENDOR ROUTES ===================
// // ===================================================

// // ---------- Vendor Dashboard Stats ----------
// router.get("/vendor/stats", authMiddleware, async (req, res) => {
//   try {
//     if (req.user.role !== "vendor") return res.status(403).json({ message: "Vendor access only" });

//     const totalProducts = await Product.countDocuments({ vendor: req.user._id });
//     const vendorOrders = await Order.find({ "items.vendor": req.user._id });

//     let totalRevenue = 0;
//     vendorOrders.forEach((order) => {
//       order.items.forEach((item) => {
//         if (item.vendor.toString() === req.user._id.toString()) {
//           totalRevenue += item.price * item.quantity;
//         }
//       });
//     });

//     res.json({ totalProducts, totalOrders: vendorOrders.length, totalRevenue });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ---------- Vendor Add Product ----------
// router.post("/vendor/add-product", authMiddleware, upload.single("image"), async (req, res) => {
//   try {
//     if (req.user.role !== "vendor") return res.status(403).json({ message: "Vendor access only" });
//     if (!req.user.isApproved) return res.status(403).json({ message: "Vendor not approved" });
//     if (!req.user.assignedCategory) return res.status(400).json({ message: "No category assigned by admin" });

//     const { name, price, description } = req.body;
//     const newProduct = new Product({
//       name,
//       price,
//       description,
//       category: req.user.assignedCategory,
//       vendor: req.user._id,
//       image: req.file ? req.file.path : null,
//     });

//     await newProduct.save();
//     res.status(201).json({ success: true, message: "Product added", product: newProduct });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ---------- Vendor's Own Products ----------
// router.get("/vendor/products", authMiddleware, async (req, res) => {
//   try {
//     if (req.user.role !== "vendor") return res.status(403).json({ message: "Vendor access only" });
    
//     const products = await Product.find({ vendor: req.user._id }).populate("category");
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });


// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");

// // ================= CONTROLLERS =================
// const {
//   home,
//   register,
//   login,
//   getLoggedInUser,
//   getAllVendors,
//   updateVendorStatus,
//   deleteVendor,

// } = require("../controllers/auth-controller");

// const {
//   createRazorpayOrder,
//   verifyPayment,
//   placeCODOrder,
// } = require("../controllers/order-controller");

// // ================= MIDDLEWARE =================
// const authMiddleware = require("../middlewares/auth-middleware");
// const adminMiddleware = require("../middlewares/admin-middleware");

// // ================= MODELS =================
// const User = require("../models/user-model");
// const Order = require("../models/order-model");
// const Product = require("../models/product-model");
// const Category = require("../models/category"); // Standardized to uppercase 'Category'

// // ================= MULTER CONFIG =================
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });
// const upload = multer({ storage });

// // ===================================================
// // ================= PUBLIC ROUTES ===================
// // ===================================================

// router.get("/", home);
// router.post("/register", register);
// router.post("/login", login);
// router.get("/user", authMiddleware, getLoggedInUser);

// // ---------- Get All Categories ----------
// // Moved here so it's accessible to both Admins and Vendors
// router.get("/categories", async (req, res) => {
//   try {
//     const categories = await Category.find();
//     res.status(200).json(categories);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch categories", error: error.message });
//   }
// });

// // ===================================================
// // ================= PAYMENT ROUTES ==================
// // ===================================================

// router.post("/create-razorpay-order", authMiddleware, createRazorpayOrder);
// router.post("/verify-payment", authMiddleware, verifyPayment);
// router.post("/place-cod-order", authMiddleware, placeCODOrder);

// // ===================================================
// // ================= ADMIN ROUTES ====================
// // ===================================================

// // ---------- Admin Stats ----------
// router.get("/admin/stats", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const users = await User.countDocuments();
//     const products = await Product.countDocuments();
//     const orders = await Order.countDocuments();
//     res.json({ users, products, orders });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ---------- Get All Users ----------
// router.get("/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const users = await User.find().select("-password");
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ---------- Delete User ----------
// router.delete("/admin/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (user.role === "admin") return res.status(400).json({ message: "Cannot delete admin" });

//     await User.findByIdAndDelete(req.params.id);
//     res.json({ message: "User deleted" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ---------- Vendor Management ----------
// router.get("/admin/vendors", authMiddleware, adminMiddleware, getAllVendors);
// router.put("/admin/vendors/:id", authMiddleware, adminMiddleware, updateVendorStatus);
// router.delete("/admin/vendors/:id", authMiddleware, adminMiddleware, deleteVendor);

// // ---------- Assign Category To Vendor ----------
// router.put("/assign-category/:vendorId", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const { categoryId } = req.body; // Expects the category name or ID
//     const vendor = await User.findById(req.params.vendorId);

//     if (!vendor) return res.status(404).json({ message: "Vendor not found" });
//     if (vendor.role !== "vendor") return res.status(400).json({ message: "User is not a vendor" });

//     vendor.assignedCategory = categoryId;
//     await vendor.save();

//     res.json({ message: "Category assigned successfully", assignedCategory: categoryId });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ===================================================
// // ================= VENDOR ROUTES ===================
// // ===================================================

// // ---------- Vendor Dashboard Stats ----------
// router.get("/vendor/stats", authMiddleware, async (req, res) => {
//   try {
//     if (req.user.role !== "vendor") return res.status(403).json({ message: "Vendor access only" });

//     const totalProducts = await Product.countDocuments({ vendor: req.user._id });
//     const vendorOrders = await Order.find({ "items.vendor": req.user._id });

//     let totalRevenue = 0;
//     vendorOrders.forEach((order) => {
//       order.items.forEach((item) => {
//         if (item.vendor.toString() === req.user._id.toString()) {
//           totalRevenue += item.price * item.quantity;
//         }
//       });
//     });

//     res.json({ totalProducts, totalOrders: vendorOrders.length, totalRevenue });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ---------- Vendor Add Product ----------
// router.post("/vendor/add-product", authMiddleware, upload.single("image"), async (req, res) => {
//   try {
//     if (req.user.role !== "vendor") return res.status(403).json({ message: "Vendor access only" });
//     if (!req.user.isApproved) return res.status(403).json({ message: "Vendor not approved" });
//     if (!req.user.assignedCategory) return res.status(400).json({ message: "No category assigned by admin" });

//     const { name, price, description } = req.body;
//     const newProduct = new Product({
//       name,
//       price,
//       description,
//       category: req.user.assignedCategory,
//       vendor: req.user._id,
//       image: req.file ? req.file.path : null,
//     });

//     await newProduct.save();
//     res.status(201).json({ success: true, message: "Product added", product: newProduct });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ---------- Vendor Products ----------
// // router.get("/vendor/products", authMiddleware, async (req, res) => {
// //   try {
// //     if (req.user.role !== "vendor") return res.status(403).json({ message: "Vendor access only" });
// //     const products = await Product.find({ vendor: req.user._id });
// //     res.json(products);
// //   } catch (error) {
// //     res.status(500).json({ message: error.message });
// //   }
// // });
// router.get("/vendor/products", authMiddleware, async (req, res) => {
//   console.log("Logged in user role:", req.user.role);

//   if (req.user.role !== "vendor") 
//     return res.status(403).json({ message: "Vendor access only" });

//   const products = await Product.find({ vendor: req.user._id });
//   res.json(products);
// });

// // coustommer
// // ===================================================
// // ================= PUBLIC ROUTES ===================
// // ===================================================

// // New route for Customers to see all products
// router.get("/all-products", async (req, res) => {
//   try {
//     const products = await Product.find().populate("category");
//     res.status(200).json(products);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch products", error: error.message });
//   }
// });
// module.exports = router;
// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");

// // ================= CONTROLLERS =================
// const {
//   home,
//   register,
//   login,
//   getLoggedInUser,
//   getAllVendors,
//   updateVendorStatus,
//   deleteVendor,
// } = require("../controllers/auth-controller");

// const {
//   createRazorpayOrder,
//   verifyPayment,
//   placeCODOrder,
// } = require("../controllers/order-controller");

// // ================= MIDDLEWARE =================
// const authMiddleware = require("../middlewares/auth-middleware");
// const adminMiddleware = require("../middlewares/admin-middleware");

// // ================= MODELS =================
// const User = require("../models/user-model");
// const Order = require("../models/order-model");
// const Product = require("../models/product-model");
// const Category = require("../models/category");

// // ================= MULTER CONFIG =================
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });
// const upload = multer({ storage });

// // ===================================================
// // ================= PUBLIC ROUTES ===================
// // ===================================================

// router.get("/", home);
// router.post("/register", register);
// router.post("/login", login);
// router.get("/user", authMiddleware, getLoggedInUser);

// // ===================================================
// // ================= PAYMENT ROUTES ==================
// // ===================================================

// router.post("/create-razorpay-order", authMiddleware, createRazorpayOrder);
// router.post("/verify-payment", authMiddleware, verifyPayment);
// router.post("/place-cod-order", authMiddleware, placeCODOrder);

// // ===================================================
// // ================= ADMIN ROUTES ====================
// // ===================================================
// const category = require("../models/Category"); // CORRECT
// // ---------- Admin Stats ----------
// // ---------- Get All Categories (for Admin/Vendor Dropdowns) ----------
// router.get("/categories", async (req, res) => {
//   try {
//     const categories = await Category.find();
//     res.status(200).json(categories);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch categories", error: error.message });
//   }
// });
// router.get("/admin/stats", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const users = await User.countDocuments();
//     const products = await Product.countDocuments();
//     const orders = await Order.countDocuments();

//     res.json({ users, products, orders });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ---------- Get All Users ----------
// router.get("/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const users = await User.find().select("-password");
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ---------- Delete User ----------
// router.delete("/admin/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.role === "admin")
//       return res.status(400).json({ message: "Cannot delete admin" });

//     await User.findByIdAndDelete(req.params.id);
//     res.json({ message: "User deleted" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ---------- Vendor Management ----------
// router.get("/admin/vendors", authMiddleware, adminMiddleware, getAllVendors);
// router.put("/admin/vendors/:id", authMiddleware, adminMiddleware, updateVendorStatus);
// router.delete("/admin/vendors/:id", authMiddleware, adminMiddleware, deleteVendor);

// // ---------- Assign Category To Vendor ----------
// router.put("/admin/assign-category/:vendorId", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const { categoryId } = req.body;

//     const vendor = await User.findById(req.params.vendorId);

//     if (!vendor)
//       return res.status(404).json({ message: "Vendor not found" });

//     if (vendor.role !== "vendor")
//       return res.status(400).json({ message: "User is not a vendor" });

//     vendor.assignedCategory = categoryId;
//     await vendor.save();

//     res.json({ message: "Category assigned successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ---------- Admin Add Product ----------
// router.post(
//   "/admin/add-product",
//   authMiddleware,
//   adminMiddleware,
//   upload.single("image"),
//   async (req, res) => {
//     try {
//       const { name, price, category, description } = req.body;

//       const newProduct = new Product({
//         name,
//         price,
//         category,
//         description,
//         image: req.file ? req.file.path : null,
//       });

//       await newProduct.save();
//       res.status(201).json({ message: "Product added successfully" });
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );

// // ===================================================
// // ================= VENDOR ROUTES ===================
// // ===================================================
// // ---------- Vendor Dashboard Stats ----------
// router.get("/vendor/stats", authMiddleware, async (req, res) => {
//   try {
//     if (req.user.role !== "vendor") {
//       return res.status(403).json({ message: "Vendor access only" });
//     }

//     // Total Products
//     const totalProducts = await Product.countDocuments({
//       vendor: req.user._id,
//     });

//     // Vendor Orders
//     const vendorOrders = await Order.find({
//       "items.vendor": req.user._id,
//     });

//     const totalOrders = vendorOrders.length;

//     // Calculate Revenue (only vendor items)
//     let totalRevenue = 0;

//     vendorOrders.forEach((order) => {
//       order.items.forEach((item) => {
//         if (item.vendor.toString() === req.user._id.toString()) {
//           totalRevenue += item.price * item.quantity;
//         }
//       });
//     });

//     res.json({
//       totalProducts,
//       totalOrders,
//       totalRevenue,
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ---------- Vendor Add Product (Only Assigned Category) ----------
// // ================= VENDOR - ADD PRODUCT =================
// router.post(
//   "/vendor/add-product",
//   authMiddleware,
//   upload.single("image"),
//   async (req, res) => {
//     try {
//       // 🔐 Check Vendor Role
//       if (req.user.role !== "vendor") {
//         return res.status(403).json({ message: "Vendor access only" });
//       }

//       // 🔐 Check Vendor Approval
//       if (!req.user.isApproved) {
//         return res.status(403).json({ message: "Vendor not approved yet" });
//       }

//       // 🔐 Check Assigned Category
//       if (!req.user.assignedCategory) {
//         return res.status(400).json({
//           message: "No category assigned by admin",
//         });
//       }

//       const { name, price, description } = req.body;

//       const newProduct = new Product({
//         name,
//         price,
//         description,
//         category: req.user.assignedCategory, // Force assigned category
//         vendor: req.user._id,
//         image: req.file ? req.file.path : null,
//       });

//       await newProduct.save();

//       res.status(201).json({
//         success: true,
//         message: "Product added successfully",
//         product: newProduct,
//       });

//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );


// // ---------- Vendor Products ----------
// router.get("/vendor/products", authMiddleware, async (req, res) => {
//   try {
//     if (req.user.role !== "vendor")
//       return res.status(403).json({ message: "Vendor access only" });

//     const products = await Product.find({ vendor: req.user._id })
//       .populate("category");

//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ---------- Vendor Orders ----------
// router.get("/vendor/orders", authMiddleware, async (req, res) => {
//   try {
//     if (req.user.role !== "vendor")
//       return res.status(403).json({ message: "Vendor access only" });

//     const orders = await Order.find({
//       "items.vendor": req.user._id,
//     }).populate("user", "email");

//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;

// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");

// const {
//   home,
//   register,
//   login,
//   getLoggedInUser,
//   getAllVendors,
//   updateVendorStatus,
//   deleteVendor,
 
// } = require("../controllers/auth-controller");

// // Import Payment Controllers
// const { 
//   createRazorpayOrder, 
//   verifyPayment,
//   placeCODOrder
// } = require("../controllers/order-controller");

// const authMiddleware = require("../middlewares/auth-middleware");
// const adminMiddleware = require("../middlewares/admin-middleware");

// // Models
// const User = require("../models/user-model");
// const Order = require("../models/order-model");
// const Product = require("../models/product-model");

// // --- Multer Configuration for Images ---
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); 
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });
// const upload = multer({ storage });

// // ================= PUBLIC & USER ROUTES =================
// router.get("/", home);
// router.post("/register", register);
// router.post("/login", login);
// router.get("/user", authMiddleware, getLoggedInUser);
// // ================= PAYMENT & CHECKOUT ROUTES =================
// router.post("/create-razorpay-order", authMiddleware, createRazorpayOrder);
// router.post("/verify-payment", authMiddleware, verifyPayment);

// // Use the controller function instead of defining the logic here for cleaner code
// router.post("/place-cod-order", authMiddleware, placeCODOrder);

// // ================= ADMIN - STATS =================
// router.get("/admin/stats", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const userCount = await User.countDocuments();
//     const orderCount = await Order.countDocuments();
//     const productCount = await Product.countDocuments();

//     res.status(200).json({
//       users: userCount,
//       products: productCount,
//       orders: orderCount,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= ADMIN - PRODUCT MGMT =================
// router.post("/admin/add-product", authMiddleware, adminMiddleware, upload.single("image"), async (req, res) => {
//   try {
//     const { name, price, category, description, sizes } = req.body;
//     const newProduct = new Product({
//       name,
//       price,
//       category,
//       description,
//       sizes: sizes ? JSON.parse(sizes) : [],
//       image: req.file ? req.file.path : null,
//     });

//     await newProduct.save();
//     res.status(201).json({ message: "Product added successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= ADMIN - USER MGMT =================
// router.get("/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const users = await User.find().select("-password");
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// router.delete("/admin/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (user.isAdmin) return res.status(400).json({ message: "Cannot delete admin" });

//     await User.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: "User deleted" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= ADMIN - ORDERS =================
// router.get("/admin/orders", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const orders = await Order.find().populate("user", "email").sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= ADMIN - VENDOR MGMT =================
// router.get("/admin/vendors", authMiddleware, adminMiddleware, getAllVendors);
// router.put("/admin/vendors/:id", authMiddleware, adminMiddleware, updateVendorStatus);
// router.delete("/admin/vendors/:id", authMiddleware, adminMiddleware, deleteVendor);

// // ================= PAYMENT & CHECKOUT ROUTES =================

// // 1. Razorpay: Create Order
// router.post("/create-razorpay-order", authMiddleware, createRazorpayOrder);

// // 2. Razorpay: Verify Payment
// router.post("/verify-payment", authMiddleware, verifyPayment);

// // 3. Cash on Delivery (COD)
// router.post("/place-cod-order", authMiddleware, async (req, res) => {
//   try {
//     const { items, totalAmount } = req.body;

//     const newOrder = new Order({
//       user: req.user._id, // Set by authMiddleware
//       items,
//       totalAmount,
//       paymentStatus: "Pending",
//       paymentMethod: "COD",
//       status: "Processing"
//     });

//     await newOrder.save();
//     res.status(201).json({ success: true, message: "COD Order placed successfully!" });
//   } catch (error) {
//     res.status(500).json({ message: "COD Error", error: error.message });
//   }
// });

// module.exports = router;
// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const path = require("path");

// const {
//   home,
//   register,
//   login,
//   getLoggedInUser,
//   getAllVendors,
//   updateVendorStatus,
//   deleteVendor,
// } = require("../controllers/auth-controller");

// const authMiddleware = require("../middlewares/auth-middleware");
// const adminMiddleware = require("../middlewares/admin-middleware");

// // Models
// const User = require("../models/user-model");
// const Order = require("../models/order-model");
// const Product = require("../models/product-model");

// // --- Multer Configuration for Images ---
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); 
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });
// const upload = multer({ storage });

// // ================= PUBLIC & USER ROUTES =================
// router.get("/", home);
// router.post("/register", register);
// router.post("/login", login);
// router.get("/user", authMiddleware, getLoggedInUser);

// // ================= ADMIN - STATS =================
// router.get("/admin/stats", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const userCount = await User.countDocuments();
//     const orderCount = await Order.countDocuments();
//     const productCount = await Product.countDocuments();

//     res.status(200).json({
//       users: userCount,
//       products: productCount,
//       orders: orderCount,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= ADMIN - PRODUCT MGMT =================
// router.post("/admin/add-product", authMiddleware, adminMiddleware, upload.single("image"), async (req, res) => {
//   try {
//     const { name, price, category, description, sizes } = req.body;
//     const newProduct = new Product({
//       name,
//       price,
//       category,
//       description,
//       sizes: sizes ? JSON.parse(sizes) : [],
//       image: req.file ? req.file.path : null,
//     });

//     await newProduct.save();
//     res.status(201).json({ message: "Product added successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= ADMIN - USER MGMT =================
// router.get("/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const users = await User.find().select("-password");
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// router.delete("/admin/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (user.isAdmin) return res.status(400).json({ message: "Cannot delete admin" });

//     await User.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: "User deleted" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= ADMIN - ORDERS =================
// router.get("/admin/orders", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const orders = await Order.find().populate("user", "email").sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= ADMIN - VENDOR MGMT (FIX FOR 404) =================
// // These routes ensure the Vendor Manager component can actually talk to the backend
// router.get("/admin/vendors", authMiddleware, adminMiddleware, getAllVendors);
// router.put("/admin/vendors/:id", authMiddleware, adminMiddleware, updateVendorStatus);
// router.delete("/admin/vendors/:id", authMiddleware, adminMiddleware, deleteVendor);

// module.exports = router;
// const express = require("express");
// const router = express.Router();

// const {
//   home,
//   register,
//   login,
//   getLoggedInUser,
//   getAllVendors,
//   updateVendorStatus,
//   deleteVendor,
// } = require("../controllers/auth-controller");

// const authMiddleware = require("../middlewares/auth-middleware");
// const adminMiddleware = require("../middlewares/admin-middleware");

// // Models
// const User = require("../models/user-model");
// const Order = require("../models/order-model");
// const Product = require("../models/product-model");

// // ================= PUBLIC & USER ROUTES =================
// router.get("/", home);
// router.post("/register", register);
// router.post("/login", login);
// router.get("/user", authMiddleware, getLoggedInUser);

// // ================= ADMIN - STATS =================
// router.get("/admin/stats", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const userCount = await User.countDocuments();
//     const orderCount = await Order.countDocuments();
//     const productCount = await Product.countDocuments();

//     res.status(200).json({
//       users: userCount,
//       products: productCount,
//       orders: orderCount,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= ADMIN - USER MANAGEMENT =================

// // Get all users
// router.get("/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const users = await User.find().select("-password");
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Delete a user
// router.delete("/admin/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
    
//     if (!user) return res.status(404).json({ message: "User not found" });
    
//     // Safety check: Prevent deleting yourself or other admins via this route
//     if (user.isAdmin) {
//       return res.status(400).json({ message: "Cannot delete an admin account." });
//     }

//     await User.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: "User deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= ADMIN - ORDERS =================
// router.get("/admin/orders", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const orders = await Order.find().populate("user", "email").sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// router.put("/admin/orders/:id", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const { status } = req.body;
//     const updatedOrder = await Order.findByIdAndUpdate(
//       req.params.id,
//       { $set: { status: status } }, 
//       { new: true, runValidators: true } 
//     );
//     res.status(200).json(updatedOrder);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= ADMIN - VENDOR MGMT =================
// router.get("/admin/vendors", authMiddleware, adminMiddleware, getAllVendors);
// router.put("/admin/vendors/:id", authMiddleware, adminMiddleware, updateVendorStatus);
// router.delete("/admin/vendors/:id", authMiddleware, adminMiddleware, deleteVendor);

// module.exports = router;
// const express = require("express");
// const router = express.Router();

// const {
//   home,
//   register,
//   login,
//   getLoggedInUser,
//   getAllVendors,
//   updateVendorStatus,
//   deleteVendor,
// } = require("../controllers/auth-controller");

// const authMiddleware = require("../middlewares/auth-middleware");
// const adminMiddleware = require("../middlewares/admin-middleware");

// // Models
// const User = require("../models/user-model");
// const Order = require("../models/order-model");
// const Product = require("../models/product-model");

// // ================= PUBLIC & USER ROUTES =================
// router.get("/", home);
// router.post("/register", register);
// router.post("/login", login);
// router.get("/user", authMiddleware, getLoggedInUser);

// // ================= ADMIN - STATS =================
// router.get("/admin/stats", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const userCount = await User.countDocuments();
//     const orderCount = await Order.countDocuments();
//     const productCount = await Product.countDocuments();

//     res.status(200).json({
//       users: userCount,
//       products: productCount,
//       orders: orderCount,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= ADMIN - USERS =================
// router.get("/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const users = await User.find().select("-password");
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= ADMIN - ORDERS =================
// router.get("/admin/orders", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const orders = await Order.find().populate("user", "email").sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// router.put("/admin/orders/:id", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const { status } = req.body;
//     const updatedOrder = await Order.findByIdAndUpdate(
//       req.params.id,
//       { $set: { status: status } }, 
//       { new: true, runValidators: true } 
//     );
//     res.status(200).json(updatedOrder);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= ADMIN - VENDOR MGMT =================
// router.get("/admin/vendors", authMiddleware, adminMiddleware, getAllVendors);
// router.put("/admin/vendors/:id", authMiddleware, adminMiddleware, updateVendorStatus);
// router.delete("/admin/vendors/:id", authMiddleware, adminMiddleware, deleteVendor);

// module.exports = router;
// const express = require("express");
// const router = express.Router();

// const {
//   home,
//   register,
//   login,
//   getLoggedInUser,
//   getAllVendors,
//   updateVendorStatus,
//   deleteVendor,
// } = require("../controllers/auth-controller");

// const authMiddleware = require("../middlewares/auth-middleware");
// const adminMiddleware = require("../middlewares/admin-middleware");

// // Models
// const User = require("../models/user-model");
// const Order = require("../models/order-model");
// const Product = require("../models/product-model"); // Ensure this model exists

// // ================= PUBLIC & USER ROUTES =================
// router.get("/", home);
// router.post("/register", register);
// router.post("/login", login);
// router.get("/user", authMiddleware, getLoggedInUser);

// // ================= ADMIN - STATS =================
// router.get("/admin/stats", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const userCount = await User.countDocuments();
//     const orderCount = await Order.countDocuments();
//     const productCount = await Product.countDocuments();

//     res.status(200).json({
//       users: userCount,
//       products: productCount,
//       orders: orderCount,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= ADMIN - USERS =================
// router.get("/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const users = await User.find().select("-password");
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ================= ADMIN - ORDERS =================
// router.get("/admin/orders", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const orders = await Order.find().populate("user", "email");
//     res.json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// router.put("/admin/orders/:id", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const { status } = req.body;
//     const updatedOrder = await Order.findByIdAndUpdate(
//       req.params.id,
//       { $set: { status: status } }, 
//       { new: true, runValidators: true } 
//     );
//     res.status(200).json(updatedOrder);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;
// const express = require("express");
// const router = express.Router();

// const {
//   home,
//   register,
//   login,
//   getLoggedInUser,
//   getAllVendors,
//   updateVendorStatus,
//   deleteVendor,
// } = require("../controllers/auth-controller");

// const authMiddleware = require("../middlewares/auth-middleware");
// const adminMiddleware = require("../middlewares/admin-middleware");

// const User = require("../models/user-model");
// const Order = require("../models/order-model");


// // ================= PUBLIC ROUTES =================

// // Home
// router.get("/", home);

// // Register
// router.post("/register", register);

// // Login
// router.post("/login", login);


// // ================= USER ROUTES =================

// // Get logged-in user
// router.get("/user", authMiddleware, getLoggedInUser);


// // ================= ADMIN - VENDOR MANAGEMENT =================

// // Get all vendors
// router.get(
//   "/admin/vendors",
//   authMiddleware,
//   adminMiddleware,
//   getAllVendors
// );

// // Approve / Reject vendor
// router.put(
//   "/admin/vendors/:id",
//   authMiddleware,
//   adminMiddleware,
//   updateVendorStatus
// );

// // Delete vendor
// router.delete(
//   "/admin/vendors/:id",
//   authMiddleware,
//   adminMiddleware,
//   deleteVendor
// );


// // ================= ADMIN - USERS =================

// // Get all users
// // router.get(
// //   "api/admin/users",
// //   authMiddleware,
// //   adminMiddleware,
// //   async (req, res) => {
// //     try {
// //       const users = await User.find().select("-password");
// //       res.json(users);
// //     } catch (error) {
// //       res.status(500).json({ message: error.message });
// //     }
// //   }
// // );
// // ================= ADMIN - USERS =================

// // Get all users
// router.get(
//   "/admin/users", // Fixed: Removed 'api/' and added '/'
//   authMiddleware,
//   adminMiddleware,
//   async (req, res) => {
//     try {
//       const users = await User.find().select("-password");
//       res.json(users);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );


// // ================= ADMIN - ORDERS =================

// // Get all orders
// router.get(
//   "/admin/orders",
//   authMiddleware,
//   adminMiddleware,
//   async (req, res) => {
//     try {
//       const orders = await Order.find().populate("user", "email");
//       res.json(orders);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );
// // Update Order Status
// // Update Order Status
// router.put(
//   "/admin/orders/:id",
//   authMiddleware,
//   adminMiddleware,
//   async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { status } = req.body;

//       // Use $set to ensure only the status field is targeted
//       const updatedOrder = await Order.findByIdAndUpdate(
//         id,
//         { $set: { status: status } }, 
//         { new: true, runValidators: true } 
//       );

//       if (!updatedOrder) {
//         return res.status(404).json({ message: "Order not found" });
//       }

//       res.status(200).json(updatedOrder);
//     } catch (error) {
//       console.error("Update Error:", error);
//       res.status(500).json({ message: error.message });
//     }
//   }
// );

// module.exports = router;
// const express = require("express");
// const router = express.Router();

// const {
//   home,
//   register,
//   login,
//   getLoggedInUser,
//   getAllVendors,
//   updateVendorStatus,
//   deleteVendor,
// } = require("../controllers/auth-controller");

// const authMiddleware = require("../middlewares/auth-middleware");
// const adminMiddleware = require("../middlewares/admin-middleware");

// // Public
// router.get("/", home);
// router.post("/register", register);
// router.post("/login", login);

// // Logged-in user
// router.get("/user", authMiddleware, getLoggedInUser);

// // Admin vendor management
// router.get("/admin/vendors", authMiddleware, adminMiddleware, getAllVendors);
// router.put("/admin/vendors/:id", authMiddleware, adminMiddleware, updateVendorStatus);
// router.delete("/admin/vendors/:id", authMiddleware, adminMiddleware, deleteVendor);

// module.exports = router;

// const express = require("express");
// const router = express.Router();

// // ================= CONTROLLERS =================
// const {
//   home,
//   register,
//   login,
//   user,
//   adminLogin,
//   getAllVendors,
//   updateVendorStatus,
//   deleteVendor, // ✅ added
// } = require("../controllers/auth-controller");

// // ================= MIDDLEWARE =================
// const { signupSchema, loginSchema } = require("../validators/auth-validator");
// const validate = require("../middlewares/validate-middleware");
// const authMiddleware = require("../middlewares/auth-middleware");
// const adminMiddleware = require("../middlewares/admin-middleware");

// // ================= PUBLIC ROUTES =================
// router.get("/", home);
// router.post("/register", validate(signupSchema), register);
// router.post("/login", validate(loginSchema), login);
// router.post("/admin/login", adminLogin);

// // ================= PROTECTED USER ROUTE =================
// router.get("/user", authMiddleware, user);

// // ================= ADMIN ROUTES =================
// router.get(
//   "/admin/vendors",
//   authMiddleware,
//   adminMiddleware,
//   getAllVendors
// );

// router.put(
//   "/admin/vendors/:id",
//   authMiddleware,
//   adminMiddleware,
//   updateVendorStatus
// );

// router.delete(
//   "/admin/vendors/:id",
//   authMiddleware,
//   adminMiddleware,
//   deleteVendor
// );

// module.exports = router;

// const express = require("express");
// const router = express.Router();

// // 1. Controller Imports
// const {
//   home,
//   register,
//   login,
//   user,
//   adminLogin,
//   getAllVendors,      
//   updateVendorStatus  
// } = require("../controllers/auth-controller");

// // 2. Middleware & Validator Imports
// const { signupSchema, loginSchema } = require("../validators/auth-validator");
// const validate = require("../middlewares/validate-middleware");
// const authMiddleware = require("../middlewares/auth-middleware");
// const adminMiddleware = require("../middlewares/admin-middleware");

// // ================= PUBLIC ROUTES =================
// router.get("/", home);
// router.post("/register", validate(signupSchema), register);
// router.post("/login", validate(loginSchema), login);
// router.post("/admin/login", adminLogin);

// // ================= PROTECTED USER ROUTES =================
// router.get("/user", authMiddleware, user);

// // ================= ADMIN ONLY ROUTES =================
// // Note: authMiddleware MUST run first to attach the user to the request
// router.route("/admin/vendors").get(authMiddleware, adminMiddleware, getAllVendors);
// router.route("/admin/vendors/:id").put(authMiddleware, adminMiddleware, updateVendorStatus);

// module.exports = router;
// const express = require("express");
// const router = express.Router();

// // Import everything from the auth-controller
// const {
//   home,
//   register,
//   login,
//   user,
//   adminLogin,
//   getAllVendors,      // Added this
//   updateVendorStatus  // Added this
// } = require("../controllers/auth-controller");

// const { signupSchema, loginSchema } = require("../validators/auth-validator");
// const validate = require("../middlewares/validate-middleware");
// const authMiddleware = require("../middlewares/auth-middleware");

// // HOME
// router.get("/", home);

// // USER REGISTER
// router.post("/register", validate(signupSchema), register);

// // USER LOGIN
// router.post("/login", validate(loginSchema), login);

// // GET LOGGED-IN USER
// router.get("/user", authMiddleware, user);

// // ADMIN LOGIN
// router.post("/admin/login", adminLogin);
// // ... existing imports ...
// // const { 
// //   getAllVendors, 
// //   updateVendorStatus 
// // } = require("../controllers/admin-controller"); // You'll create this controller next

// const adminMiddleware = require("../middlewares/admin-middleware"); // To ensure only admins can do this

// // --- VENDOR MANAGEMENT ROUTES ---

// // Route to get all vendors (Used by AdminVendorManager.jsx)
// router.route("/admin/vendors").get(authMiddleware, adminMiddleware, getAllVendors);

// // Route to approve/reject a vendor
// router.route("/admin/vendors/:id").put(authMiddleware, adminMiddleware, updateVendorStatus);

// module.exports = router;


