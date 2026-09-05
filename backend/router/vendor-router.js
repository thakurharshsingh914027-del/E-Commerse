const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const { isVendor } = require("../middlewares/role-middleware");
const upload = require("../middlewares/upload");

// Models
const User = require("../models/user-model");
const Order = require("../models/order-model");
const Product = require("../models/product");
const Category = require("../models/Category");

const normalizeCategory = (value = "") => value.trim().toLowerCase();

/* ==========================================
    GET VENDOR STATS
    GET /api/vendor/stats
========================================== */
router.get("/stats", authMiddleware, isVendor, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ vendor: req.user._id });
    const orders = await Order.find({ "items.vendor": req.user._id });

    let revenue = 0;
    let activeOrders = 0;
    let completedOrders = 0;

    orders.forEach((order) => {
      // Logic: If the whole order is delivered, we can count it as completed
      // unless we want strict per-item tracking.
      const isWholeOrderDelivered = order.status && order.status.toLowerCase() === "delivered";

      order.items.forEach((item) => {
        if (item.vendor && item.vendor.toString() === req.user._id.toString()) {
          revenue += (item.price || 0) * (item.quantity || 0);
          
          const itemStatus = item.status ? item.status.toLowerCase() : "";

          // Check both item-level and order-level status
          if (itemStatus === "delivered" || isWholeOrderDelivered) {
            completedOrders++;
          } else if (itemStatus !== "cancelled" && order.status.toLowerCase() !== "cancelled") {
            activeOrders++;
          }
        }
      });
    });

    res.status(200).json({ 
      totalProducts, 
      activeOrders, 
      completedOrders, 
      revenue 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ==========================================
    PRODUCT MANAGEMENT
========================================== */

// GET ALL PRODUCTS FOR LOGGED-IN VENDOR
router.get("/products", authMiddleware, isVendor, async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ONE PRODUCT FOR LOGGED-IN VENDOR
router.get("/products/:id", authMiddleware, isVendor, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      vendor: req.user._id,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found or unauthorized." });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET LIVE CATEGORIES FOR VENDOR PRODUCT FORM
router.get("/categories", authMiddleware, isVendor, async (req, res) => {
  try {
    const [categories, vendor] = await Promise.all([
      Category.find().sort({ name: 1 }),
      User.findById(req.user._id).populate("assignedCategory", "name"),
    ]);

    res.status(200).json({
      success: true,
      categories,
      assignedCategory: vendor?.assignedCategory || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD NEW PRODUCT
/* ==============================
    ADD PRODUCT (Alias for old frontend)
================================= */
router.post("/add-product", authMiddleware, isVendor, upload.single("image"), async (req, res) => {
  // Logic is exactly the same as /products
  try {
    if (!req.file) return res.status(400).json({ message: "Product image is required." });

    const { name, description, price, comparePrice, category, stock, isFeatured } = req.body;
    const normalizedCategory = normalizeCategory(category);

    const product = new Product({
      name,
      description,
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : null,
      category: normalizedCategory,
      stock: stock ? Number(stock) : 0,
      image: req.file.path || req.file.secure_url,
      vendor: req.user._id,
      isFeatured: isFeatured === 'true' || isFeatured === true,
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// UPDATE PRODUCT (Supports Image, Data, and Status Toggles)
router.patch("/products/:id", authMiddleware, isVendor, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Auth Check: Ensure product belongs to this vendor
    const product = await Product.findOne({ _id: id, vendor: req.user._id });
    if (!product) {
      return res.status(404).json({ message: "Product not found or unauthorized." });
    }

    const updateData = { ...req.body };

    // 1. Handle New Image
    if (req.file) {
      updateData.image = req.file.path || req.file.secure_url;
    }

    // 2. Normalize Category
    if (updateData.category) {
      updateData.category = normalizeCategory(updateData.category);
    }

    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }
    if (updateData.comparePrice !== undefined) {
      updateData.comparePrice = updateData.comparePrice ? Number(updateData.comparePrice) : null;
    }
    if (updateData.stock !== undefined) {
      updateData.stock = Number(updateData.stock);
    }

    // 3. Convert stringified booleans (from FormData) to real Booleans
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
    }
    if (updateData.isFeatured !== undefined) {
      updateData.isFeatured = updateData.isFeatured === 'true' || updateData.isFeatured === true;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
});

// DELETE PRODUCT
router.delete('/products/:id', authMiddleware, isVendor, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ 
      _id: req.params.id, 
      vendor: req.user._id 
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ==========================================
    ORDER MANAGEMENT
========================================== */

// GET ORDERS CONTAINING VENDOR'S ITEMS
router.get("/orders", authMiddleware, isVendor, async (req, res) => {
  try {
    const orders = await Order.find({ "items.vendor": req.user._id })
      .sort({ createdAt: -1 })
      .populate("user", "name email phone");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE STATUS OF SPECIFIC ITEM IN ORDER
router.patch("/orders/:orderId/status", authMiddleware, isVendor, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findById(orderId);
    
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.items.forEach((item) => {
      if (item.vendor.toString() === req.user._id.toString()) {
        item.status = status;
      }
    });

    // If all items in the order are delivered, mark the whole order delivered
    const allDelivered = order.items.every(item => item.status === "Delivered");
    order.status = allDelivered ? "Delivered" : "Processing";

    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
// const express = require("express");
// const router = express.Router();
// const authMiddleware = require("../middlewares/auth-middleware");
// const { isVendor } = require("../middlewares/role-middleware");
// const upload = require("../middlewares/upload");

// // Models
// const User = require("../models/user-model");
// const Order = require("../models/order-model");
// const Product = require("../models/product");

// /* ==============================
//     GET VENDOR STATS
// ================================= */
// router.get("/stats", authMiddleware, isVendor, async (req, res) => {
//   try {
//     const totalProducts = await Product.countDocuments({ vendor: req.user._id });
//     const orders = await Order.find({ "items.vendor": req.user._id });

//     let revenue = 0;
//     let activeOrders = 0;
//     let completedOrders = 0;

//     orders.forEach((order) => {
//       order.items.forEach((item) => {
//         if (item.vendor.toString() === req.user._id.toString()) {
//           revenue += item.price * item.quantity;
//           if (item.status === "Delivered") {
//             completedOrders++;
//           } else if (item.status !== "Cancelled") {
//             activeOrders++;
//           }
//         }
//       });
//     });

//     res.status(200).json({ totalProducts, activeOrders, completedOrders, revenue });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
// /* ==============================
//     ADD PRODUCT (Updated Logic)
// ================================= */
// router.post("/add-product", authMiddleware, isVendor, upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "Product image is required." });
//     }

//     const { name, description, price, category, stock, isFeatured } = req.body;

//     const product = new Product({
//       name,
//       description,
//       price,
//       // FIX: Capitalize first letter to match Mongoose Enum (e.g., "electronics" -> "Electronics")
//       category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(), 
//       subcategory: req.body.subcategory || "",
//       brand: req.body.brand || "",
//       isFeatured: isFeatured === 'true' || isFeatured === true, 
//       stock: stock || 0,
//       image: req.file.path || req.file.secure_url,
//       vendor: req.user._id,
//     });

//     await product.save();
//     res.status(201).json({ success: true, product });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// /* ==============================
//     GET VENDOR PRODUCTS
// ================================= */
// router.get("/products", authMiddleware, isVendor, async (req, res) => {
//   try {
//     const products = await Product.find({ vendor: req.user._id }).sort({ createdAt: -1 });
//     res.status(200).json(products);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// /* ==============================
//     ADD PRODUCT
// ================================= */
// router.post("/products", authMiddleware, isVendor, upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: "Product image is required." });

//     const { name, description, price, category, stock, isFeatured } = req.body;

//     const product = new Product({
//       name,
//       description,
//       price,
//       category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
//       stock: stock || 0,
//       image: req.file.path || req.file.secure_url,
//       vendor: req.user._id,
//       isFeatured: isFeatured === 'true' || isFeatured === true,
//     });

//     await product.save();
//     res.status(201).json({ success: true, product });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// /* ==============================
//     UPDATE PRODUCT (The Updated Function)
// ================================= */
// router.patch("/products/:id", authMiddleware, isVendor, upload.single("image"), async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     // Check if product exists and belongs to this vendor
//     const product = await Product.findOne({ _id: id, vendor: req.user._id });
//     if (!product) {
//       return res.status(404).json({ message: "Product not found or unauthorized." });
//     }

//     const updateData = { ...req.body };

//     // 1. Handle Image Update if a new file is uploaded
//     if (req.file) {
//       updateData.image = req.file.path || req.file.secure_url;
//     }

//     // 2. Handle Category Normalization if category is being updated
//     if (updateData.category) {
//       updateData.category = 
//         updateData.category.charAt(0).toUpperCase() + 
//         updateData.category.slice(1).toLowerCase();
//     }

//     // 3. Handle Boolean Conversions (for status/isFeatured toggles)
//     if (updateData.isActive !== undefined) {
//       updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
//     }
//     if (updateData.isFeatured !== undefined) {
//       updateData.isFeatured = updateData.isFeatured === 'true' || updateData.isFeatured === true;
//     }

//     const updatedProduct = await Product.findByIdAndUpdate(
//       id,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     res.status(200).json({ success: true, product: updatedProduct });
//   } catch (error) {
//     res.status(500).json({ message: "Update failed", error: error.message });
//   }
// });

// /* ==============================
//     DELETE PRODUCT
// ================================= */
// /* ==============================
//     DELETE PRODUCT
// ================================= */
// router.delete('/products/:id', authMiddleware, isVendor, async (req, res) => {
//   try {
//     // We use findOneAndDelete to ensure the product belongs to the requesting vendor
//     const product = await Product.findOneAndDelete({ 
//       _id: req.params.id, 
//       vendor: req.user._id 
//     });

//     if (!product) {
//       return res.status(404).json({ message: "Product not found or unauthorized" });
//     }

//     res.status(200).json({ message: "Product deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// /* ==============================
//     ORDER MANAGEMENT
// ================================= */
// router.get("/orders", authMiddleware, isVendor, async (req, res) => {
//   try {
//     const orders = await Order.find({ "items.vendor": req.user._id })
//       .sort({ createdAt: -1 })
//       .populate("user", "name email phone");
//     res.status(200).json(orders);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// router.patch("/orders/:orderId/status", authMiddleware, isVendor, async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { status } = req.body;
//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     order.items.forEach((item) => {
//       if (item.vendor.toString() === req.user._id.toString()) item.status = status;
//     });

//     const allDelivered = order.items.every(item => item.status === "Delivered");
//     order.status = allDelivered ? "Delivered" : "Processing";

//     await order.save();
//     res.status(200).json({ success: true, order });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;
