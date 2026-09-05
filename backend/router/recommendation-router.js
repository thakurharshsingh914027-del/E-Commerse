const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const {
  recordActivity,
  getWishlist,
  removeFromWishlist,
  getTrendingProducts,
  getSimilarProducts,
  getUserRecommendations,
  getFrequentlyBoughtTogether,
} = require("../controllers/recommendation-controller");

const router = express.Router();

router.post("/activity", authMiddleware, recordActivity);
router.get("/wishlist", authMiddleware, getWishlist);
router.delete("/wishlist/:productId", authMiddleware, removeFromWishlist);
router.get("/trending", getTrendingProducts);
router.get("/similar/:productId", getSimilarProducts);
router.get("/user/:userId", authMiddleware, getUserRecommendations);
router.get("/frequently-bought-together/:productId", getFrequentlyBoughtTogether);

module.exports = router;
