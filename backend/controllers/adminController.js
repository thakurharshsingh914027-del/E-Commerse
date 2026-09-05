const Product = require("../models/product");
const User = require("../models/User");
const Order = require("../models/Order");
const UserActivity = require("../models/UserActivity");

const getDashboardSummary = async (_req, res) => {
  try {
    const [productCount, userCount, orderCount, activityCount] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments(),
      Order.countDocuments(),
      UserActivity.countDocuments(),
    ]);

    return res.json({
      productCount,
      userCount,
      orderCount,
      activityCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRecommendationLogs = async (_req, res) => {
  try {
    const activities = await UserActivity.find()
      .populate("userId", "name email")
      .populate("productId", "name category")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json(activities);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardSummary,
  getUsers,
  getRecommendationLogs,
};
