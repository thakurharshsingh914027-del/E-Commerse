const express = require("express");
const {
  getDashboardSummary,
  getUsers,
  getRecommendationLogs,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.use(protect, adminOnly);
router.get("/summary", getDashboardSummary);
router.get("/users", getUsers);
router.get("/recommendation-logs", getRecommendationLogs);

module.exports = router;
