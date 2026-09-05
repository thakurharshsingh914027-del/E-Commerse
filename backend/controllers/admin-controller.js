const User = require("../models/user-model");
const Product = require("../models/product");
const Order = require("../models/order-model");
const Category = require("../models/Category");
const UserActivity = require("../models/UserActivity");

const getDashboardSummary = async (_req, res) => {
  try {
    const [productCount, userCount, orderCount, activityCount] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      UserActivity.countDocuments(),
    ]);

    res.status(200).json({
      productCount,
      userCount,
      orderCount,
      activityCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecommendationLogs = async (_req, res) => {
  try {
    const logs = await UserActivity.find({})
      .populate("userId", "username email")
      .populate("productId", "name category")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    // 1. Get counts
    const totalUsers = await User.countDocuments(); 
    const totalProducts = await Product.countDocuments();
    
    // 2. Fetch orders, POPULATE user details, and calculate revenue
    // Added .populate("user", "username") to get the username field
    const orders = await Order.find()
      .populate("user", "username") 
      .sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    // 3. Get the 5 most recent orders
    const recentOrders = orders.slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update your module.exports at the bottom

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .populate("assignedCategory", "name")
      .select("-password");
    console.log(`[Admin Log] Non-admin users fetched: ${users.length}`); 
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getAdminCategories = async (req, res) => {
  try {
    const [savedCategories, productCategories] = await Promise.all([
      Category.find({}).sort({ name: 1 }),
      Product.distinct("category"),
    ]);

    const categoryMap = new Map();

    savedCategories.forEach((category) => {
      if (category?.name) {
        categoryMap.set(category.name, category);
      }
    });

    productCategories.filter(Boolean).forEach((name) => {
      if (!categoryMap.has(name)) {
        categoryMap.set(name, { _id: name, name });
      }
    });

    const categories = Array.from(categoryMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const assignVendorCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedCategory } = req.body;

    const vendor = await User.findById(id);
    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    if (!assignedCategory) {
      vendor.assignedCategory = null;
    } else {
      const category =
        (await Category.findById(assignedCategory).catch(() => null)) ||
        (await Category.findOneAndUpdate(
          { name: assignedCategory },
          { name: assignedCategory },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        ));

      if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
      }
      vendor.assignedCategory = category._id;
    }

    await vendor.save();
    await vendor.populate("assignedCategory", "name");

    res.status(200).json({
      success: true,
      message: vendor.assignedCategory
        ? `Vendor assigned to ${vendor.assignedCategory.name}`
        : "Vendor category cleared",
      user: vendor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// admin see the all analytics data
// backend/controllers/admin-controller.js

const getAdminAnalytics = async (req, res) => {
  try {
    const topVendors = await Order.aggregate([
      // 1. Unwind the items array so we can look at each product's vendor
      { $unwind: "$items" }, 
      
      // 2. Group by the vendor field (ensure this matches your Order model)
      {
        $group: {
          _id: "$items.vendor", // or "$items.vendorId"
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $addToSet: "$_id" } 
        }
      },
      
      // 3. Join with Users collection to get the vendor's name
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "vendorInfo"
        }
      },
      { $unwind: "$vendorInfo" },
      
      // 4. Format the output for the frontend
      {
        $project: {
          vendorId: "$_id",
          vendorName: "$vendorInfo.username", // Matches 'harsh singh'
          storeName: "$vendorInfo.storeName",
          totalRevenue: 1,
          totalOrders: { $size: "$totalOrders" }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.status(200).json({ success: true, data: { topVendors } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}) // Now 'Order' is defined
      .populate("user", "username email ") 
      .sort({ createdAt: -1 });

    console.log(`[Admin] Total orders retrieved: ${orders.length}`);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    // This catch block was likely triggering because 'Order' was missing
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch orders",
      error: error.message 
    });
  }
};
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Find the order and update its status field
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true } // This returns the modified document instead of the original
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: updatedOrder
        });
    } catch (error) {
        console.error("Status Update Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 2. Safety: Prevent admin from deleting themselves
        // req.user._id comes from your authMiddleware
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ 
                success: false, 
                message: "Security Error: You cannot delete your own admin account." 
            });
        }

        // 3. Perform deletion
        await User.findByIdAndDelete(id);

        res.status(200).json({ 
            success: true, 
            message: "User deleted successfully" 
        });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



module.exports = { 
    getDashboardSummary,
    getRecommendationLogs,
    getAdminDashboard, 
    getAdminAnalytics, 
    getAllUsers, 
    getAdminCategories,
    assignVendorCategory,
    getAllOrders,
    updateOrderStatus,
    deleteUser,
    
    
};
// const User = require("../models/user-model");
// const Product = require("../models/product");
// // const Order = require("../models/order-model"); // Ensure this exists or comment out

// const getAdminDashboard = async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments() || 0;
//     const totalProducts = await Product.countDocuments() || 0;
    
//     // Defaulting to 0 if you don't have orders logic yet
//     res.status(200).json({
//       success: true,
//       data: {
//         totalUsers,
//         totalProducts,
//         totalOrders: 0,
//         totalRevenue: 0,
//         recentOrders: []
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const getAdminAnalytics = async (req, res) => {
//   try {
//     res.status(200).json({
//       success: true,
//       data: { categories: [], topProducts: [] }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// // backend/controllers/admin-controller.js
// const getAllUsers = async (req, res) => {
//   try {
//     // $ne means "Not Equal" - this excludes Admins
//     const users = await User.find({ role: { $ne: "Admin" } }).select("-password");
    
//     // This keeps your terminal logs clean of Admin data
//     console.log(`Users fetched: ${users.length}`); 
    
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };
// const getAllOrders = async (req, res) => {
//   try {
//     // This is a placeholder. You need to implement the Order model and logic.
//     const orders = []; // await Order.find({}).populate("user", "name email");

//     res.status(200).json(orders);
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // CRITICAL: These must be exported
// module.exports = { getAdminDashboard, getAdminAnalytics, getAllUsers, getAllOrders };
