const express = require("express");
const router = express.Router();

// Import all controllers
// Note: addProduct is removed from here
// product-router.js (around line 12)
const {
  getAllProducts,
  deleteProduct,
  getSearchResults,
  getFeaturedProducts,
  getProductById
} = require("../controllers/product-controller");

const adminMiddleware = require("../middlewares/admin-middleware");
const authMiddleware = require("../middlewares/auth-middleware");

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * @route   GET /api/products
 * @desc    Get all products
 */
router.get("/", getAllProducts);

/**
 * @route   GET /api/products/search
 * @desc    Search products by query
 */
router.get("/search", getSearchResults);

/**
 * @route   GET /api/products/featured
 * @desc    Get products marked as featured
 */
router.get("/featured", getFeaturedProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 */
router.get("/:id", getProductById);


// ==========================================
// ADMIN ROUTES (Protected)
// ==========================================

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product (Admin Only)
 */

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);


module.exports = router;
