const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      default: "High-performance hardware unit. Optimized for system efficiency.",
    },
    price: {
      type: Number,
      required: true,
    },
    comparePrice: {
      type: Number,
      default: null,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "accessories",
        "camera",
        "components",
        "desktop",
        "laptop",
        "monitor",
        "networking",
        "office-equipment",
        "Electronics",
        "banner",
        "brand",
        "slider",
        "deals",
        "top-rated",
        "best-sellers",
      ],
    },
    brand: {
      type: String,
      default: "ShopMart",
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, default: "" },
        comment: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    specifications: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      default: 1,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    salesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

productSchema.index({
  name: "text",
  category: "text",
  description: "text",
  specifications: "text",
  brand: "text",
  tags: "text",
});

productSchema.index({ category: 1 });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
module.exports = Product;
