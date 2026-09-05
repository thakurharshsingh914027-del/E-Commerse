const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const adminMiddleware = require("../middlewares/admin-middleware"); 
const User = require("../models/user-model");
const { 
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
   
    
    // Fetches all orders from DB
} = require("../controllers/admin-controller");

// Dashboard & Stats
router.get("/summary", authMiddleware, adminMiddleware, getDashboardSummary);
router.get("/dashboard", authMiddleware, adminMiddleware, getAdminDashboard);
router.get("/analytics", authMiddleware, adminMiddleware, getAdminAnalytics);
router.get("/categories", authMiddleware, adminMiddleware, getAdminCategories);
router.get("/recommendation-logs", authMiddleware, adminMiddleware, getRecommendationLogs);


// Management
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.get("/orders", authMiddleware, adminMiddleware, getAllOrders); // Path: /api/admin/orders

// NOTE: You are currently mapping /products to getAllOrders. 
// You should eventually replace this with a real getAllProducts controller.
router.get("/products", authMiddleware, adminMiddleware, getAllOrders); 
// This is a placeholder. You need to implement the getAllProducts function in your admin-controller and replace getAllOrders with it here.
// admin-router.js
// Ensure the ID parameter comes before /status
router.put("/orders/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);
// This route is for updating order status. The URL should be /api/admin/user /delete/:id, and the controller function should be updateOrderStatus. Make sure to implement this function in your admin-controller.js file.
// Route: DELETE /api/admin/users/:id
// This matches: DELETE /api/admin/users/:id
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);
router.put("/vendors/:id/category", authMiddleware, adminMiddleware, assignVendorCategory);
// aprove vendor
// Check for: Method (PUT), Path (/vendors/:id/approve), and Middleware
// Check this in your backend routes file
// Fixed Route: Added proper middleware chain
router.put('/vendors/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Toggle approval status
        user.isApproved = !user.isApproved;
        await user.save();

        res.json({ 
            success: true, 
            message: `User ${user.isApproved ? 'approved' : 'pending'}`,
            user 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

