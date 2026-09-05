const Product = require("../models/product");

// @desc    Fetch all products
// @route   GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const { category, q, search, sort, limit, minPrice, maxPrice, rating, page } = req.query;
    const query = {};

    if (category) {
      const categories = String(category)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (categories.length === 1) {
        query.category = categories[0];
      } else if (categories.length > 1) {
        query.category = { $in: categories };
      }
    }

    const searchTerm = q || search;
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { category: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };
    if (sort === "price-asc") sortOption = { price: 1 };
    if (sort === "price-desc") sortOption = { price: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "featured") sortOption = { isFeatured: -1, createdAt: -1 };
    if (sort === "rating") sortOption = { rating: -1, numReviews: -1 };
    if (sort === "popular") sortOption = { numReviews: -1, rating: -1 };

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageSize = Math.max(Number(limit) || 0, 0);
    let productQuery = Product.find(query)
      .populate("vendor", "username email role")
      .sort(sortOption);

    if (pageSize) {
      productQuery = productQuery.skip((currentPage - 1) * pageSize).limit(pageSize);
    }

    const [products, total] = await Promise.all([
      productQuery,
      Product.countDocuments(query),
    ]);

    if (pageSize || page || searchTerm || category || minPrice || maxPrice || rating || sort) {
      return res.status(200).json({
        products,
        total,
        page: currentPage,
        pages: pageSize ? Math.ceil(total / pageSize) : 1,
      });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search products by name or category
// @route   GET /api/products/search
const getSearchResults = async (req, res) => {
  try {
    const { q } = req.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
const getFeaturedProducts = async (req, res) => {
  try {
    let products = await Product.find({ isFeatured: true })
      .populate("vendor", "username email role")
      .sort({ createdAt: -1 })
      .limit(8);

    if (!products.length) {
      products = await Product.find({})
        .populate("vendor", "username email role")
        .sort({ rating: -1, salesCount: -1, createdAt: -1 })
        .limit(8);
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "vendor",
      "username email role"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product (Admin Only)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRITICAL: Match these names exactly in your product-router.js
module.exports = {
  getAllProducts,
  getSearchResults,
  getFeaturedProducts,
  getProductById,
  deleteProduct
};
