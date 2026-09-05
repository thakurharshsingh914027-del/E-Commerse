const axios = require("axios");
const Product = require("../models/product");
const Order = require("../models/order-model");
const User = require("../models/user-model");
const UserActivity = require("../models/UserActivity");

const mlClient = axios.create({
  baseURL: process.env.ML_SERVICE_URL || "http://127.0.0.1:8000",
  timeout: 4000,
});

const actionWeights = {
  view: 1,
  like: 3,
  cart: 4,
  purchase: 5,
};

const normalizeProduct = (product) => ({
  _id: product._id.toString(),
  name: product.name || "",
  description: product.description || "",
  category: typeof product.category === "string" ? product.category : "",
  brand: product.brand || "",
  tags: Array.isArray(product.tags) ? product.tags : [],
  price: Number(product.price || 0),
  rating: Number(product.rating || 0),
  salesCount: Number(product.salesCount || product.numReviews || 0),
});

const tokenize = (text) =>
  new Set(
    String(text)
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .map((token) => token.trim())
      .filter(Boolean)
  );

const productDocument = (product) =>
  `${product.name} ${product.category} ${product.brand} ${product.description} ${(
    product.tags || []
  ).join(" ")} ${Array.isArray(product.specifications) ? product.specifications.join(" ") : ""}`;

const overlapScore = (left, right) => {
  let score = 0;
  for (const token of left) {
    if (right.has(token)) score += 1;
  }
  return score;
};

const mapProductsInOrder = async (ids) => {
  const products = await Product.find({ _id: { $in: ids } });
  const dictionary = new Map(products.map((product) => [product._id.toString(), product]));
  return ids.map((id) => dictionary.get(String(id))).filter(Boolean);
};

const recordActivity = async (req, res) => {
  try {
    const { productId, actionType } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const activity = await UserActivity.create({
      userId: req.user._id,
      productId: product._id,
      actionType,
      category: product.category,
      tags: product.tags || [],
    });

    if (actionType === "like") {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { likedProducts: product._id },
      });
    }

    return res.status(201).json(activity);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("likedProducts")
      .select("likedProducts");

    return res.status(200).json({ products: user?.likedProducts || [] });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { likedProducts: req.params.productId },
    });

    return res.status(200).json({ message: "Removed from wishlist" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const fallbackTrending = async (limit = 8) => {
  const [products, activities] = await Promise.all([
    Product.find(),
    UserActivity.find({
      createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14) },
    }),
  ]);

  const activityBoost = activities.reduce((acc, activity) => {
    const key = activity.productId.toString();
    acc[key] = (acc[key] || 0) + (actionWeights[activity.actionType] || 1);
    return acc;
  }, {});

  return products
    .map((product) => ({
      product,
      score:
        Number(product.salesCount || 0) * 3 +
        Number(product.rating || 0) * 10 +
        (activityBoost[product._id.toString()] || 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
};

const fallbackSimilar = async (productId, limit = 8) => {
  const products = await Product.find();
  const base = products.find((product) => product._id.toString() === String(productId));
  if (!base) return [];

  const baseTokens = tokenize(productDocument(base));

  return products
    .filter((product) => product._id.toString() !== String(productId))
    .map((product) => {
      const currentTokens = tokenize(productDocument(product));
      let score = overlapScore(baseTokens, currentTokens);
      if (product.category === base.category) score += 4;
      if (product.brand === base.brand) score += 2;
      score += Number(product.rating || 0);
      return { product, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
};

const fallbackUserRecommendations = async (userId, limit = 8) => {
  const [products, activities, orders] = await Promise.all([
    Product.find(),
    UserActivity.find({ userId }).sort({ createdAt: -1 }),
    Order.find({ user: userId }),
  ]);

  const purchasedIds = new Set(
    orders.flatMap((order) => order.items.map((item) => item.product.toString()))
  );

  const profileText = activities
    .map((activity) => {
      const weight = actionWeights[activity.actionType] || 1;
      const fragment = `${activity.category} ${(activity.tags || []).join(" ")}`.trim();
      return Array(weight).fill(fragment).join(" ");
    })
    .join(" ");

  if (!profileText.trim()) {
    return fallbackTrending(limit);
  }

  const profileTokens = tokenize(profileText);

  return products
    .filter((product) => !purchasedIds.has(product._id.toString()))
    .map((product) => {
      const tokens = tokenize(productDocument(product));
      return {
        product,
        score:
          overlapScore(profileTokens, tokens) +
          Number(product.rating || 0) +
          Number(product.salesCount || 0) * 0.05,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
};

const getTrendingProducts = async (_req, res) => {
  try {
    try {
      const [products, activities] = await Promise.all([Product.find(), UserActivity.find()]);
      const response = await mlClient.post("/recommend/trending", {
        products: products.map(normalizeProduct),
        activities,
      });
      const ranked = await mapProductsInOrder(response.data.product_ids || []);
      return res.status(200).json({ source: "ml-service", products: ranked });
    } catch (_error) {
      const fallback = await fallbackTrending();
      return res.status(200).json({ source: "fallback", products: fallback });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getSimilarProducts = async (req, res) => {
  try {
    const productId = req.params.productId;

    try {
      const products = await Product.find();
      const response = await mlClient.post("/recommend/similar", {
        product_id: String(productId),
        products: products.map(normalizeProduct),
      });
      const ranked = await mapProductsInOrder(response.data.product_ids || []);
      return res.status(200).json({ source: "ml-service", products: ranked });
    } catch (_error) {
      const fallback = await fallbackSimilar(productId);
      return res.status(200).json({ source: "fallback", products: fallback });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;

    try {
      const [products, activities, orders] = await Promise.all([
        Product.find(),
        UserActivity.find({ userId }),
        Order.find({ user: userId }),
      ]);

      const response = await mlClient.post("/recommend/user", {
        user_id: String(userId),
        products: products.map(normalizeProduct),
        activities,
        orders,
      });
      const ranked = await mapProductsInOrder(response.data.product_ids || []);
      return res.status(200).json({ source: "ml-service", products: ranked });
    } catch (_error) {
      const fallback = await fallbackUserRecommendations(userId);
      return res.status(200).json({ source: "fallback", products: fallback });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getFrequentlyBoughtTogether = async (req, res) => {
  try {
    const productId = String(req.params.productId);
    const orders = await Order.find({ "items.product": productId });
    const counts = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const currentId = item.product.toString();
        if (currentId !== productId) {
          counts[currentId] = (counts[currentId] || 0) + Number(item.quantity || 1);
        }
      });
    });

    const ids = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id]) => id);

    const products = await mapProductsInOrder(ids);
    return res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  recordActivity,
  getWishlist,
  removeFromWishlist,
  getTrendingProducts,
  getSimilarProducts,
  getUserRecommendations,
  getFrequentlyBoughtTogether,
};
