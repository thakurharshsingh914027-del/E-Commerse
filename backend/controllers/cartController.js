const User = require("../models/User");
const Product = require("../models/product");
const UserActivity = require("../models/UserActivity");

const getCart = async (req, res) => {
  const user = await User.findById(req.user._id).populate("cart.product");
  return res.json(user.cart);
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user._id);
    const existingItem = user.cart.find((item) => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      user.cart.push({ product: productId, quantity: Number(quantity) });
    }

    await user.save();
    await UserActivity.create({
      userId: req.user._id,
      productId: product._id,
      actionType: "cart",
      category: product.category,
      tags: product.tags,
    });

    const populatedUser = await User.findById(req.user._id).populate("cart.product");
    return res.status(201).json(populatedUser.cart);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);
    const item = user.cart.find((cartItem) => cartItem.product.toString() === req.params.productId);

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    item.quantity = Number(quantity);
    if (item.quantity <= 0) {
      user.cart = user.cart.filter(
        (cartItem) => cartItem.product.toString() !== req.params.productId
      );
    }

    await user.save();
    const populatedUser = await User.findById(req.user._id).populate("cart.product");
    return res.json(populatedUser.cart);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(
      (cartItem) => cartItem.product.toString() !== req.params.productId
    );
    await user.save();

    const populatedUser = await User.findById(req.user._id).populate("cart.product");
    return res.json(populatedUser.cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
