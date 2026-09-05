const axios = require("axios");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const UserActivity = require("../models/UserActivity");

const mlClient = axios.create({
  baseURL: process.env.ML_SERVICE_URL,
  timeout: 4000,
});

const weightByAction = {
  view: 1,
  like: 3,
  cart: 4,
  purchase: 5,
};

const buildProductDocument = (product) =>
  `${product.name} ${product.category} ${product.brand} ${product.tags.join(" ")} ${product.description}`.toLowerCase();

const tokenize = (text) =>
  new Set(
    text
      .split(/[^a-z0-9]+/i)
      .map((token) => token.trim())
      .filter(Boolean)
  );

const scoreOverlap = (left, right) => {
  let score = 0;
  for (const token of left) {
    if (right.has(token)) score += 1;
  }
  return score;
};

const getFallbackUserRecommendations = async (userId, limit = 8) => {
  const [products, activities, orders, user] = await Promise.all([
    Product.find(),
    UserActivity.find({ userId }).sort({ createdAt: -1 }),
    Order.find({ user: userId }),
    User.findById(userId).lean(),
  ]);

  const purchasedIds = new Set(
    orders.flatMap((order) => order.items.map((item) => item.product.toString()))
  );

  const likedIds = new Set((user?.likedProducts || []).map((id) => id.toString()));

  const interestBag = [];
  const recentProductIds = [];

  activities.forEach((activity) => {
    const weight = weightByAction[activity.actionType] || 1;
    const descriptor = `${activity.category} ${(activity.tags || []).join(" ")}`.trim();
    for (let index = 0; index < weight; index += 1) {
      interestBag.push(descriptor);
    }
    recentProductIds.push(activity.productId.toString());
  });

  const interestTokens = tokenize(interestBag.join(" "));

  const ranked = products
    .filter((product) => !purchasedIds.has(product._id.toString()))
    .map((product) => {
      const productTokens = tokenize(buildProductDocument(product));
      let score = scoreOverlap(interestTokens, productTokens);

      if (recentProductIds.includes(product._id.toString())) score += 2;
      if (likedIds.has(product._id.toString())) score += 4;
      score += product.rating;
      score += product.salesCount * 0.08;

      return { product, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);

  return ranked;
};

const getFallbackSimilarProducts = async (productId, limit = 8) => {
  const products = await Product.find();
  const baseProduct = products.find((product) => product._id.toString() === productId);

  if (!baseProduct) {
    return [];
  }

  const baseTokens = tokenize(buildProductDocument(baseProduct));

  return products
    .filter((product) => product._id.toString() !== productId)
    .map((product) => {
      const productTokens = tokenize(buildProductDocument(product));
      let score = scoreOverlap(baseTokens, productTokens);

      if (product.category === baseProduct.category) score += 3;
      if (product.brand === baseProduct.brand) score += 2;
      score += Math.max(0, 2 - Math.abs(product.price - baseProduct.price) / 1000);
      score += product.rating;

      return { product, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
};

const getFallbackTrendingProducts = async (limit = 8) => {
  const [products, recentActivity] = await Promise.all([
    Product.find(),
    UserActivity.find({
      createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14) },
    }),
  ]);

  const activityCounts = recentActivity.reduce((acc, activity) => {
    const key = activity.productId.toString();
    acc[key] = (acc[key] || 0) + (weightByAction[activity.actionType] || 1);
    return acc;
  }, {});

  return products
    .map((product) => ({
      product,
      score:
        product.salesCount * 3 +
        product.rating * 10 +
        (activityCounts[product._id.toString()] || 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
};

const mapIdsToProducts = async (ids) => {
  const products = await Product.find({ _id: { $in: ids } });
  const dictionary = new Map(products.map((product) => [product._id.toString(), product]));
  return ids.map((id) => dictionary.get(id)).filter(Boolean);
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
      productId,
      actionType,
      category: product.category,
      tags: product.tags,
    });

    if (actionType === "like") {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { likedProducts: productId } });
    }

    return res.status(201).json(activity);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;
    const [products, activities, orders] = await Promise.all([
      Product.find(),
      UserActivity.find({ userId }).sort({ createdAt: -1 }),
      Order.find({ user: userId }),
    ]);

    try {
      const response = await mlClient.post("/recommend/user", {
        user_id: userId,
        products,
        activities,
        orders,
      });
      const recommendedProducts = await mapIdsToProducts(response.data.product_ids || []);
      return res.json({
        source: "ml-service",
        products: recommendedProducts,
      });
    } catch (error) {
      const fallbackProducts = await getFallbackUserRecommendations(userId);
      return res.json({
        source: "fallback",
        products: fallbackProducts,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getSimilarProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    try {
      const response = await mlClient.post("/recommend/similar", {
        product_id: product._id.toString(),
        products: await Product.find(),
      });
      const similarProducts = await mapIdsToProducts(response.data.product_ids || []);
      return res.json({
        source: "ml-service",
        products: similarProducts,
      });
    } catch (error) {
      const fallbackProducts = await getFallbackSimilarProducts(product._id.toString());
      return res.json({
        source: "fallback",
        products: fallbackProducts,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getTrendingProducts = async (_req, res) => {
  try {
    try {
      const response = await mlClient.post("/recommend/trending", {
        products: await Product.find(),
        activities: await UserActivity.find(),
      });
      const trendingProducts = await mapIdsToProducts(response.data.product_ids || []);
      return res.json({
        source: "ml-service",
        products: trendingProducts,
      });
    } catch (error) {
      const fallbackProducts = await getFallbackTrendingProducts();
      return res.json({
        source: "fallback",
        products: fallbackProducts,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getFrequentlyBoughtTogether = async (req, res) => {
  try {
    const orders = await Order.find({ "items.product": req.params.productId });
    const counts = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.product.toString();
        if (productId !== req.params.productId) {
          counts[productId] = (counts[productId] || 0) + item.quantity;
        }
      });
    });

    const ids = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([productId]) => productId);

    const products = await mapIdsToProducts(ids);
    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  recordActivity,
  getUserRecommendations,
  getSimilarProducts,
  getTrendingProducts,
  getFrequentlyBoughtTogether,
};
