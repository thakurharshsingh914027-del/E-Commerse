require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Product = require("../models/product");
const User = require("../models/User");

const products = [
  {
    name: "NovaX Pro Wireless Headphones",
    description: "Immersive ANC headphones with spatial audio, deep bass, and 40-hour battery life.",
    price: 8999,
    category: "audio",
    brand: "NovaX",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    rating: 4.7,
    stock: 45,
    tags: ["wireless", "anc", "music", "premium"],
    salesCount: 122,
  },
  {
    name: "PixelNest Smartwatch S2",
    description: "Fitness-first smartwatch with AMOLED display, sleep tracking, GPS, and waterproof body.",
    price: 6499,
    category: "wearables",
    brand: "PixelNest",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    rating: 4.5,
    stock: 60,
    tags: ["fitness", "health", "gps", "smartwatch"],
    salesCount: 98,
  },
  {
    name: "Zenith Ultra HD Monitor 27",
    description: "27-inch 4K IPS monitor with HDR, low blue light, and ultra-thin bezels for creators.",
    price: 21999,
    category: "monitors",
    brand: "Zenith",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
    rating: 4.8,
    stock: 25,
    tags: ["4k", "monitor", "creator", "display"],
    salesCount: 76,
  },
  {
    name: "CloudCore Gaming Laptop 15",
    description: "RTX-powered laptop built for gaming and editing with high refresh rate and fast SSD.",
    price: 88999,
    category: "laptops",
    brand: "CloudCore",
    image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    rating: 4.6,
    stock: 18,
    tags: ["gaming", "laptop", "rtx", "performance"],
    salesCount: 41,
  },
  {
    name: "AuraHome Air Purifier Max",
    description: "Smart HEPA purifier with quiet night mode and app-connected air quality insights.",
    price: 11999,
    category: "home-appliances",
    brand: "AuraHome",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=900&q=80",
    rating: 4.4,
    stock: 33,
    tags: ["home", "smart", "purifier", "hepa"],
    salesCount: 57,
  },
  {
    name: "VoltEdge Mechanical Keyboard",
    description: "Hot-swappable RGB mechanical keyboard with tactile switches and compact layout.",
    price: 4999,
    category: "accessories",
    brand: "VoltEdge",
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
    rating: 4.6,
    stock: 80,
    tags: ["keyboard", "rgb", "mechanical", "gaming"],
    salesCount: 149,
  },
  {
    name: "SkySnap Mirrorless Camera X5",
    description: "Travel-friendly mirrorless camera with 4K recording, stabilization, and fast autofocus.",
    price: 52999,
    category: "cameras",
    brand: "SkySnap",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    rating: 4.7,
    stock: 22,
    tags: ["camera", "4k", "travel", "creator"],
    salesCount: 52,
  },
  {
    name: "ChargeFlow GaN Adapter 100W",
    description: "Compact fast charger with dual USB-C ports for laptops, tablets, and phones.",
    price: 2999,
    category: "accessories",
    brand: "ChargeFlow",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80",
    rating: 4.3,
    stock: 100,
    tags: ["charger", "gan", "usb-c", "travel"],
    salesCount: 188,
  },
  {
    name: "EchoBeam Bluetooth Speaker",
    description: "Portable speaker with punchy sound, water resistance, and weekend-long battery.",
    price: 3799,
    category: "audio",
    brand: "EchoBeam",
    image: "https://images.unsplash.com/photo-1507878866276-a947ef722fee?auto=format&fit=crop&w=900&q=80",
    rating: 4.4,
    stock: 58,
    tags: ["speaker", "portable", "bluetooth", "party"],
    salesCount: 132,
  },
  {
    name: "DataDock USB-C Hub 8-in-1",
    description: "All-in-one USB-C hub with HDMI, card reader, ethernet, and power delivery.",
    price: 4299,
    category: "accessories",
    brand: "DataDock",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
    rating: 4.2,
    stock: 67,
    tags: ["hub", "usb-c", "productivity", "laptop"],
    salesCount: 114,
  },
  {
    name: "PureView Tablet 11",
    description: "Sleek entertainment tablet with quad speakers, vivid display, and stylus support.",
    price: 26999,
    category: "tablets",
    brand: "PureView",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80",
    rating: 4.5,
    stock: 35,
    tags: ["tablet", "entertainment", "stylus", "display"],
    salesCount: 65,
  },
  {
    name: "CometRun Running Shoes",
    description: "Lightweight performance shoes with cushioned sole, breathable mesh, and daily comfort.",
    price: 5599,
    category: "fashion",
    brand: "CometRun",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    rating: 4.4,
    stock: 73,
    tags: ["shoes", "running", "fitness", "comfort"],
    salesCount: 87,
  }
];

const seed = async () => {
  try {
    await connectDB();
    await Product.deleteMany();

    let admin = await User.findOne({ email: "admin@example.com" });
    if (!admin) {
      admin = await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: await bcrypt.hash("admin123", 10),
        role: "admin",
      });
    }

    await Product.insertMany(products);

    console.log("Products seeded successfully");
    console.log("Admin login: admin@example.com / admin123");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
