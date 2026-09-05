const express = require("express");
const Groq = require("groq-sdk");
require("dotenv").config();

const Product = require("../models/product");
const Order = require("../models/order-model");

const router = express.Router();

const groq = process.env.GROQ_API_KEY
  ? new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })
  : null;

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ reply: "Ask me something!" });
  }

  try {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("track") || lowerMessage.includes("order")) {
      const orderIdMatch = message.match(/[0-9a-fA-F]{24}/);

      if (orderIdMatch) {
        const order = await Order.findById(orderIdMatch[0]);

        if (order) {
          return res.json({
            reply: `Order Status: ${order.status}`,
            order,
          });
        }

        return res.json({ reply: "Order not found." });
      }
    }

    const categories = ["men", "women", "ladies", "kids"];
    const foundCategory = categories.find((category) =>
      lowerMessage.includes(category)
    );

    if (foundCategory) {
      const products = await Product.find({
        category: { $regex: foundCategory, $options: "i" },
      }).limit(4);

      if (products.length > 0) {
        return res.json({
          reply: `Here are some ${foundCategory} products you may like:`,
          products,
        });
      }
    }

    if (!groq) {
      return res.json({
        reply:
          "Chat assistant is not configured right now, but shopping and recommendations are available.",
      });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are ShopBot, an intelligent assistant for an ecommerce store. Be concise, helpful, and friendly.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiReply = completion.choices[0].message.content;
    return res.json({ reply: aiReply });
  } catch (error) {
    console.error("Chatbot error:", error);
    return res.status(500).json({
      reply: "Brain freeze! Try again.",
      error: error.message,
    });
  }
});

module.exports = router;
