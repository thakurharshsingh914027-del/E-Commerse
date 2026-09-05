const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const UserActivity = require("../models/UserActivity");

const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = "cod" } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const normalizedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product || item._id);

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      const quantity = Number(item.quantity) || 1;
      totalAmount += product.price * quantity;

      normalizedItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
        category: product.category,
      });

      product.salesCount += quantity;
      product.stock = Math.max(product.stock - quantity, 0);
      await product.save();

      await UserActivity.create({
        userId: req.user._id,
        productId: product._id,
        actionType: "purchase",
        category: product.category,
        tags: product.tags,
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items: normalizedItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });

    return res.status(201).json(order);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
};
