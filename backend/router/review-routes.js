const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const authMiddleware = require("../middlewares/auth-middleware");

/**
 * @route   POST /api/reviews
 * @desc    Add a review to a product
 * @access  Private
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { rating, title, comment, product: productId } = req.body;

    // 1. Validation
    if (!rating || !productId) {
      return res.status(400).json({ message: "Rating and Product ID are required" });
    }

    // 2. Find the product
    const product = await Product.findById(productId).select("reviews rating numReviews");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 3. Check if user already reviewed this product
    const alreadyReviewed = (product.reviews || []).find(
      (rev) => String(rev.user) === String(req.user._id)
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    // 4. Create the review object
    const review = {
      user: req.user._id,
      name: req.user.username || req.user.name || "Anonymous", // Fallback for your user model
      rating: Number(rating),
      title: title || "",
      comment: comment || "",
      createdAt: new Date()
    };

    // 5. Calculate the new aggregate values before updating.
    const updatedReviews = [...product.reviews, review];
    const numReviews = updatedReviews.length;
    const totalRatingPoints = updatedReviews.reduce(
      (acc, item) => acc + Number(item.rating || 0),
      0
    );
    const averageRating = numReviews ? totalRatingPoints / numReviews : 0;

    // 6. Persist only the review-related fields so legacy products missing
    // unrelated required fields (such as vendor) can still accept reviews.
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $push: { reviews: review },
        $set: {
          numReviews,
          rating: averageRating,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("reviews rating numReviews");

    res.status(201).json({ 
      success: true,
      message: "Review added successfully", 
      product: updatedProduct
    });

  } catch (error) {
    console.error("Review Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/reviews/:productId
 * @desc    Get all reviews for a specific product
 * @access  Public
 */
router.get("/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select("reviews rating numReviews");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({
      reviews: product.reviews,
      rating: product.rating,
      numReviews: product.numReviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CRITICAL: Must export exactly like this to avoid the index.js crash!
module.exports = router;
