const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/order-model");
const Product = require("../models/product");
const User = require("../models/user-model");

// ================= RAZORPAY CONFIG =================
const hasRazorpayConfig =
  Boolean(process.env.RAZORPAY_KEY_ID) && Boolean(process.env.RAZORPAY_KEY_SECRET);

const razorpay = hasRazorpayConfig
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID.trim(),
      key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
    })
  : null;

const isCustomerAccount = (user) => user?.role?.toLowerCase() === "customer";

const blockNonCustomerShopping = (req, res) => {
  if (isCustomerAccount(req.user)) return false;

  res.status(403).json({
    success: false,
    message: "Only customer accounts can shop. Please login with a customer account.",
  });
  return true;
};

// ===================================================
// 🔥 USER SECTION
// ===================================================

exports.getMyOrders = async (req, res) => {
  try {
    // req.user._id comes from your 'protect' middleware
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: orders // This must match your frontend destructuring
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ================= CANCEL ORDER =================
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Security: Check if the order belongs to the logged-in user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    // Logic: Prevent cancellation if already shipped
    if (order.status === 'Shipped' || order.status === 'Delivered') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel an order that is already ${order.status}` 
      });
    }

    order.status = 'Cancelled';
    // If you implemented "reason", save it here
    order.cancelReason = req.body.reason; 
    
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================================================
// 💳 ONLINE PAYMENT SECTION (RAZORPAY)
// ===================================================

// ================= CREATE RAZORPAY ORDER =================
exports.createRazorpayOrder = async (req, res) => {
  try {
    if (blockNonCustomerShopping(req, res)) return;

    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: "Online payments are not configured on this server",
      });
    }

    const options = {
      amount: Math.round(req.body.amount * 100), // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);

  } catch (error) {
    res.status(500).json({
      message: "Razorpay Error",
      error: error.message,
    });
  }
};

// ================= VERIFY PAYMENT & CREATE ORDER =================
exports.verifyPayment = async (req, res) => {
  try {
    if (blockNonCustomerShopping(req, res)) return;

    if (!razorpay || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        success: false,
        message: "Online payments are not configured on this server",
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      totalAmount,
      shippingAddress // 👈 Extracted from frontend request
    } = req.body;

    // 1. Verify Signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET.trim())
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // 2. Create the Order in DB
    const newOrder = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress, // 👈 Address now saved
      paymentStatus: "Paid",
      paymentMethod: "Online",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: "Processing",
    });

    res.status(200).json({
      success: true,
      message: "Payment verified and order created",
      order: newOrder,
    });

  } catch (error) {
    res.status(500).json({
      message: "Verification Error",
      error: error.message,
    });
  }
};

// ===================================================
// 🚚 CASH ON DELIVERY (COD)
// ===================================================

exports.placeCODOrder = async (req, res) => {
  try {
    if (blockNonCustomerShopping(req, res)) return;

    const { items, shippingAddress } = req.body; // 👈 Get address from frontend

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    let totalAmount = 0;
    const formattedItems = [];
    let fallbackVendor = null;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      let vendorId = product.vendor;

      if (!vendorId) {
        if (!fallbackVendor) {
          fallbackVendor = await User.findOne({
            role: { $in: ["vendor", "admin"] },
          }).select("_id");
        }

        if (!fallbackVendor) {
          fallbackVendor = { _id: req.user._id };
        }

        vendorId = fallbackVendor._id;
      }

      totalAmount += product.price * item.quantity;

      formattedItems.push({
        product: product._id,
        vendor: vendorId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const newOrder = new Order({
      user: req.user._id,
      items: formattedItems,
      totalAmount,
      shippingAddress, // 👈 Address now saved
      paymentMethod: "COD",
      paymentStatus: "Pending",
      status: "Processing",
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "COD Order placed successfully",
      order: newOrder,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===================================================
// 👑 ADMIN SECTION
// ===================================================

// ================= GET ALL ORDERS =================
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// ================= UPDATE ORDER STATUS =================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };

    // Update specific timestamps based on status
    if (status === "Delivered") {
      updateData.paymentStatus = "Paid";
      updateData.deliveredAt = Date.now();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order: updatedOrder,
    });

  } catch (error) {
    res.status(500).json({
      message: "Update Error",
      error: error.message,
    });
  }
};
// const Razorpay = require("razorpay");
// const crypto = require("crypto");
// const Order = require("../models/order-model");
// const Product = require("../models/product-model");

// // ================= RAZORPAY CONFIG =================
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID.trim(),
//   key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
// });


// // ===================================================
// // 🔥 USER SECTION
// // ===================================================

// // ================= GET MY ORDERS =================
// exports.getMyOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.user._id })
//       .sort({ createdAt: -1 });

//     res.status(200).json(orders);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };


// // ================= CANCEL ORDER =================
// exports.cancelOrder = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id);

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     if (order.user.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     if (order.status === "Delivered") {
//       return res.status(400).json({
//         message: "Delivered orders cannot be cancelled",
//       });
//     }

//     order.status = "Cancelled";
//     await order.save();

//     res.status(200).json({
//       success: true,
//       message: "Order cancelled successfully",
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: "Cancel Error",
//       error: error.message,
//     });
//   }
// };


// // ===================================================
// // 💳 ONLINE PAYMENT SECTION (RAZORPAY)
// // ===================================================

// // ================= CREATE RAZORPAY ORDER =================
// exports.createRazorpayOrder = async (req, res) => {
//   try {
//     const options = {
//       amount: Math.round(req.body.amount * 100),
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     };

//     const order = await razorpay.orders.create(options);
//     res.status(200).json(order);

//   } catch (error) {
//     res.status(500).json({
//       message: "Razorpay Error",
//       error: error.message,
//     });
//   }
// };


// // ================= VERIFY PAYMENT =================
// exports.verifyPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       items,
//       totalAmount
//     } = req.body;

//     const sign = razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSign = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET.trim())
//       .update(sign.toString())
//       .digest("hex");

//     if (razorpay_signature !== expectedSign) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid signature",
//       });
//     }

//     const newOrder = await Order.create({
//       user: req.user._id,
//       items,
//       totalAmount,
//       paymentStatus: "Paid",
//       paymentMethod: "Online",
//       razorpayOrderId: razorpay_order_id,
//       razorpayPaymentId: razorpay_payment_id,
//       status: "Processing",
//     });

//     res.status(200).json({
//       success: true,
//       order: newOrder,
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: "Verification Error",
//       error: error.message,
//     });
//   }
// };


// // ===================================================
// // 🚚 CASH ON DELIVERY (COD)
// // ===================================================

// exports.placeCODOrder = async (req, res) => {
//   try {
//     const { items } = req.body;

//     if (!items || items.length === 0) {
//       return res.status(400).json({ message: "No items in order" });
//     }

//     let totalAmount = 0;
//     const formattedItems = [];

//     for (const item of items) {
//       const product = await Product.findById(item.productId);

//       if (!product) {
//         return res.status(404).json({ message: `Product ${item.productId} not found` });
//       }

//       // 🔥 CRITICAL CHECK: Does the product have a vendor in the DB?
//       if (!product.vendor) {
//         return res.status(400).json({ 
//           message: `Internal Error: Product "${product.name}" is missing a vendor ID in the database.` 
//         });
//       }

//       totalAmount += product.price * item.quantity;

//       formattedItems.push({
//         product: product._id,   // Schema expects 'product'
//         vendor: product.vendor,   // Schema expects 'vendor'
//         name: product.name,
//         price: product.price,
//         quantity: item.quantity,
//       });
//     }

//     // Move order creation OUTSIDE the loop
//     const newOrder = new Order({
//       user: req.user._id,
//       items: formattedItems,
//       totalAmount,
//       paymentMethod: "COD",
//       paymentStatus: "Pending",
//       status: "Processing",
//     });

//     await newOrder.save();

//     res.status(201).json({
//       success: true,
//       message: "COD Order placed successfully",
//       order: newOrder,
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

//   // ===================================================
//   // 👑 ADMIN SECTION
//   // ===================================================

//   // ================= GET ALL ORDERS =================
//   exports.getAllOrders = async (req, res) => {
//     try {
//       const orders = await Order.find()
//         .populate("user", "email")
//         .sort({ createdAt: -1 });

//       res.status(200).json(orders);

//     } catch (error) {
//       res.status(500).json({
//         message: "Failed to fetch orders",
//         error: error.message,
//       });
//     }
//   };


//   // ================= UPDATE ORDER STATUS =================
//   exports.updateOrderStatus = async (req, res) => {
//     try {
//       const { status } = req.body;

//       const updateData = { status };

//       // If COD and delivered → mark payment Paid
//       if (status === "Delivered") {
//         updateData.paymentStatus = "Paid";
//       }

//       const updatedOrder = await Order.findByIdAndUpdate(
//         req.params.id,
//         updateData,
//         { new: true }
//       );

//       if (!updatedOrder) {
//         return res.status(404).json({
//           message: "Order not found",
//         });
//       }

//       res.status(200).json({
//         success: true,
//         message: "Order status updated",
//         order: updatedOrder,
//       });

//     } catch (error) {
//       res.status(500).json({
//         message: "Update Error",
//         error: error.message,
//       });
//     }
//   };

