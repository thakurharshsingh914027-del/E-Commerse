const express = require("express");
const {
  recordActivity,
  getUserRecommendations,
  getSimilarProducts,
  getTrendingProducts,
  getFrequentlyBoughtTogether,
} = require("../controllers/recommendationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/activity", protect, recordActivity);
router.get("/user/:userId", protect, getUserRecommendations);
router.get("/similar/:productId", getSimilarProducts);
router.get("/trending", getTrendingProducts);
router.get("/frequently-bought-together/:productId", getFrequentlyBoughtTogether);

module.exports = router;
