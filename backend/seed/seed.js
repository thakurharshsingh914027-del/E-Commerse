require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const connectDB = require("../utils/db");
const Category = require("../models/Category");
const Order = require("../models/order-model");
const Product = require("../models/product");
const User = require("../models/user-model");

const categoryNames = [
  "accessories",
  "camera",
  "components",
  "desktop",
  "laptop",
  "monitor",
  "networking",
  "office-equipment",
];

const imageForCategory = {
  accessories: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80",
  camera: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
  components: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80",
  desktop: "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?auto=format&fit=crop&w=900&q=80",
  laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
  monitor: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
  networking: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80",
  "office-equipment": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80",
};

const vendorCategoryGroups = {
  "vendor1@shophub.com": ["laptop", "accessories", "camera"],
  "vendor2@shophub.com": ["components", "desktop", "networking"],
  "vendor3@shophub.com": ["monitor", "office-equipment"],
};

const productBlueprints = [
  {
    category: "accessories",
    items: [
      [
        "Mechanical Gaming Keyboard",
        4299,
        "Full-size wired mechanical keyboard with tactile switches for gaming and coding sessions.",
        ["Outemu blue switches", "Per-key RGB lighting", "Detachable USB-C cable"],
      ],
      [
        "Wireless Ergonomic Mouse",
        1799,
        "Silent ergonomic mouse designed for office work, browsing, and long daily use.",
        ["2.4GHz wireless dongle", "Adjustable DPI 800-1600", "Battery-saving sleep mode"],
      ],
      [
        "7-in-1 USB-C Hub",
        2699,
        "Compact USB-C hub for laptops with display output, card reader support, and charging passthrough.",
        ["4K HDMI output", "100W PD passthrough", "SD and microSD slots"],
      ],
    ],
  },
  {
    category: "camera",
    items: [
      [
        "Mirrorless 24MP Camera",
        64999,
        "Interchangeable-lens mirrorless camera for travel, portrait, and 4K content creation.",
        ["24.2MP APS-C sensor", "4K 30fps video", "Wi-Fi and Bluetooth transfer"],
      ],
      [
        "4K Action Camera",
        13999,
        "Rugged action camera for biking, travel, and underwater recording with built-in stabilization.",
        ["4K ultra HD capture", "Electronic image stabilization", "Waterproof case included"],
      ],
      [
        "Professional Camera Tripod",
        2599,
        "Lightweight aluminum tripod for DSLR and mirrorless cameras with quick height adjustment.",
        ["360-degree ball head", "Quick-release plate", "Foldable travel design"],
      ],
    ],
  },
  {
    category: "components",
    items: [
      [
        "RTX 4070 Graphics Card",
        74999,
        "High-performance graphics card built for AAA gaming, rendering, and AI-assisted workflows.",
        ["12GB GDDR6X memory", "Triple-fan thermal design", "Ray tracing and DLSS support"],
      ],
      [
        "B760 DDR5 Motherboard",
        18499,
        "ATX motherboard for Intel desktop builds with modern connectivity and upgrade headroom.",
        ["DDR5 memory support", "PCIe 5.0 slot", "Wi-Fi 6 and Bluetooth"],
      ],
      [
        "1TB NVMe Gen4 SSD",
        6999,
        "Fast internal SSD for operating systems, games, and creative project files.",
        ["Up to 5000MB/s read speed", "1TB storage capacity", "Low-profile heat spreader"],
      ],
    ],
  },
  {
    category: "desktop",
    items: [
      [
        "Ryzen 7 Gaming Desktop",
        94999,
        "Prebuilt gaming desktop with strong thermal performance for esports, streaming, and editing.",
        ["AMD Ryzen 7 processor", "16GB DDR5 RAM", "RTX-class dedicated graphics"],
      ],
      [
        "Compact Mini PC",
        28999,
        "Space-saving desktop for home offices, billing counters, and media playback.",
        ["Intel Core i5 processor", "16GB RAM", "512GB NVMe SSD"],
      ],
      [
        "27-inch All-in-One Desktop",
        55999,
        "Clean all-in-one desktop for family use, classes, and office productivity without extra clutter.",
        ["27-inch full HD display", "Wireless keyboard and mouse", "1TB SSD storage"],
      ],
    ],
  },
  {
    category: "laptop",
    items: [
      [
        "14-inch Ultrabook Pro",
        82999,
        "Slim premium laptop for professionals who need portability, battery life, and daily performance.",
        ["14-inch 2.2K display", "16GB LPDDR5 RAM", "65W fast charging"],
      ],
      [
        "Creator OLED Laptop",
        112499,
        "Powerful creator laptop for video editing, graphic design, and multitasking-heavy workflows.",
        ["15.6-inch OLED panel", "32GB RAM", "Dedicated RTX graphics"],
      ],
      [
        "Student Everyday Laptop",
        41999,
        "Affordable laptop for classes, assignments, browsing, and light programming work.",
        ["Full HD anti-glare display", "8GB RAM", "512GB SSD"],
      ],
    ],
  },
  {
    category: "monitor",
    items: [
      [
        "27-inch 4K IPS Monitor",
        32999,
        "Sharp 4K monitor ideal for design work, spreadsheets, and detailed multitasking.",
        ["3840x2160 IPS panel", "HDR support", "USB-C connectivity"],
      ],
      [
        "27-inch 165Hz Gaming Monitor",
        25999,
        "Fast gaming monitor for competitive titles with smooth motion and low response time.",
        ["165Hz refresh rate", "1ms response time", "QHD resolution"],
      ],
      [
        "15.6-inch Portable Monitor",
        14999,
        "Portable second screen for travel, remote work, and dual-screen laptop setups.",
        ["Dual USB-C ports", "Slim aluminum body", "Built-in kickstand cover"],
      ],
    ],
  },
  {
    category: "networking",
    items: [
      [
        "Dual-Band Wi-Fi 6 Router",
        8999,
        "Home and small-office router with better speed, range, and stable multi-device performance.",
        ["AX3000 dual-band speed", "Gigabit WAN/LAN ports", "Mesh system support"],
      ],
      [
        "Mesh Wi-Fi Expansion Node",
        6499,
        "Add-on mesh unit for extending wireless coverage across larger homes and offices.",
        ["Whole-home coverage", "App-based setup", "Seamless roaming"],
      ],
      [
        "8-Port Gigabit Switch",
        2499,
        "Reliable unmanaged switch for desktops, CCTV systems, printers, and wired office setups.",
        ["8 gigabit ethernet ports", "Fanless silent operation", "Metal industrial chassis"],
      ],
    ],
  },
  {
    category: "office-equipment",
    items: [
      [
        "Wireless Laser Printer",
        17999,
        "Office-ready monochrome laser printer for invoices, notes, and fast document printing.",
        ["Auto duplex printing", "Wi-Fi direct support", "High-yield toner compatibility"],
      ],
      [
        "ADF Document Scanner",
        11999,
        "Compact document scanner for forms, ID copies, and office digitization workflows.",
        ["Automatic document feeder", "OCR-ready scanning", "USB plug-and-play"],
      ],
      [
        "LED Ergonomic Desk Lamp",
        2999,
        "Adjustable study and office lamp with multiple brightness levels for long desk hours.",
        ["Touch dimming controls", "USB phone charging", "Flexible arm design"],
      ],
      [
        "Bluetooth Label Printer",
        4599,
        "Portable thermal label printer for office folders, shipping labels, and retail tagging.",
        ["Bluetooth app pairing", "Ink-free thermal printing", "Rechargeable battery"],
      ],
    ],
  },
];

const userSeeds = [
  {
    username: "Admin User",
    email: "admin@shophub.com",
    phone: "9000000001",
    password: "password123",
    role: "admin",
    isApproved: true,
  },
  {
    username: "Tech Vendor One",
    email: "vendor1@shophub.com",
    phone: "9000000002",
    password: "vendor123",
    role: "vendor",
    isApproved: true,
    category: "laptop",
  },
  {
    username: "Tech Vendor Two",
    email: "vendor2@shophub.com",
    phone: "9000000003",
    password: "vendor123",
    role: "vendor",
    isApproved: true,
    category: "components",
  },
  {
    username: "Tech Vendor Three",
    email: "vendor3@shophub.com",
    phone: "9000000004",
    password: "vendor123",
    role: "vendor",
    isApproved: true,
    category: "monitor",
  },
  {
    username: "Customer One",
    email: "customer1@shophub.com",
    phone: "9000000005",
    password: "customer123",
    role: "customer",
    isApproved: true,
  },
  {
    username: "Customer Two",
    email: "customer2@shophub.com",
    phone: "9000000006",
    password: "customer123",
    role: "customer",
    isApproved: true,
  },
  {
    username: "Customer Three",
    email: "customer3@shophub.com",
    phone: "9000000007",
    password: "customer123",
    role: "customer",
    isApproved: true,
  },
  {
    username: "Customer Four",
    email: "customer4@shophub.com",
    phone: "9000000008",
    password: "customer123",
    role: "customer",
    isApproved: true,
  },
  {
    username: "Customer Five",
    email: "customer5@shophub.com",
    phone: "9000000009",
    password: "customer123",
    role: "customer",
    isApproved: true,
  },
];

function averageRating(reviews) {
  if (!reviews.length) return 0;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / reviews.length).toFixed(1));
}

function findVendorForCategory(category, vendors) {
  return (
    vendors.find((vendor) =>
      (vendorCategoryGroups[vendor.email] || []).includes(category)
    ) || vendors[0]
  );
}

async function seedDatabase() {
  await connectDB();

  try {
    await Promise.all([
      Order.deleteMany({}),
      Product.deleteMany({}),
      User.deleteMany({}),
      Category.deleteMany({}),
    ]);

    const categories = await Category.insertMany(
      categoryNames.map((name) => ({ name }))
    );
    const categoryMap = new Map(categories.map((category) => [category.name, category]));

    const hashedUsers = await Promise.all(
      userSeeds.map(async (user) => ({
        username: user.username,
        email: user.email,
        phone: user.phone,
        password: await bcrypt.hash(user.password, 10),
        role: user.role,
        isApproved: user.isApproved,
        assignedCategory: user.category ? categoryMap.get(user.category)._id : null,
      }))
    );

    const users = await User.insertMany(hashedUsers);
    const vendors = users.filter((user) => user.role === "vendor");
    const customers = users.filter((user) => user.role === "customer");
    const productsToInsert = [];

    for (const blueprint of productBlueprints) {
      const vendor = findVendorForCategory(blueprint.category, vendors);

      for (const [name, price, description, specifications] of blueprint.items) {
        const stockBase = productsToInsert.length + 1;

        productsToInsert.push({
          name,
          description,
          price,
          vendor: vendor._id,
          category: blueprint.category,
          image: imageForCategory[blueprint.category],
          specifications,
          stock: 6 + (stockBase % 15),
          isFeatured: stockBase % 5 === 0,
        });
      }
    }

    const products = await Product.insertMany(productsToInsert);

    const reviewTemplates = [
      { productIndex: 0, customerIndex: 0, rating: 5, title: "Excellent", comment: "Solid build quality and very smooth to use." },
      { productIndex: 1, customerIndex: 1, rating: 4, title: "Good Value", comment: "Works well and feels responsive for daily use." },
      { productIndex: 3, customerIndex: 2, rating: 5, title: "Loved It", comment: "Image quality is great and setup was easy." },
      { productIndex: 6, customerIndex: 3, rating: 4, title: "Powerful", comment: "Handles demanding workloads without trouble." },
      { productIndex: 9, customerIndex: 4, rating: 5, title: "Highly Recommended", comment: "Fast, quiet, and perfect for work." },
      { productIndex: 12, customerIndex: 0, rating: 4, title: "Nice Display", comment: "Sharp screen and colors look really good." },
      { productIndex: 18, customerIndex: 1, rating: 5, title: "Reliable", comment: "Network coverage improved right away." },
      { productIndex: 22, customerIndex: 2, rating: 4, title: "Useful", comment: "Compact and helpful for a small office." },
    ];

    for (const review of reviewTemplates) {
      const product = products[review.productIndex];
      const customer = customers[review.customerIndex];
      product.reviews.push({
        user: customer._id,
        name: customer.username,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        createdAt: new Date(),
      });
      product.numReviews = product.reviews.length;
      product.rating = averageRating(product.reviews);
      await product.save();
    }

    const orders = [
      {
        user: customers[0]._id,
        items: [
          {
            product: products[0]._id,
            vendor: products[0].vendor,
            name: products[0].name,
            price: products[0].price,
            quantity: 1,
            image: products[0].image,
          },
          {
            product: products[4]._id,
            vendor: products[4].vendor,
            name: products[4].name,
            price: products[4].price,
            quantity: 1,
            image: products[4].image,
          },
        ],
        shippingAddress: {
          fullName: "Customer One",
          address: "123 Tech Park Road",
          city: "Prayagraj",
          state: "Uttar Pradesh",
          pincode: "211001",
          phone: "9000000005",
        },
        totalAmount: products[0].price + products[4].price,
        status: "Delivered",
        paymentStatus: "Paid",
        paymentMethod: "Online",
        deliveredAt: new Date(),
      },
      {
        user: customers[1]._id,
        items: [
          {
            product: products[7]._id,
            vendor: products[7].vendor,
            name: products[7].name,
            price: products[7].price,
            quantity: 2,
            image: products[7].image,
          },
        ],
        shippingAddress: {
          fullName: "Customer Two",
          address: "44 Civil Lines",
          city: "Lucknow",
          state: "Uttar Pradesh",
          pincode: "226001",
          phone: "9000000006",
        },
        totalAmount: products[7].price * 2,
        status: "Processing",
        paymentStatus: "Pending",
        paymentMethod: "COD",
      },
      {
        user: customers[2]._id,
        items: [
          {
            product: products[10]._id,
            vendor: products[10].vendor,
            name: products[10].name,
            price: products[10].price,
            quantity: 1,
            image: products[10].image,
          },
          {
            product: products[15]._id,
            vendor: products[15].vendor,
            name: products[15].name,
            price: products[15].price,
            quantity: 1,
            image: products[15].image,
          },
        ],
        shippingAddress: {
          fullName: "Customer Three",
          address: "9 MG Road",
          city: "Kanpur",
          state: "Uttar Pradesh",
          pincode: "208001",
          phone: "9000000007",
        },
        totalAmount: products[10].price + products[15].price,
        status: "Shipped",
        paymentStatus: "Paid",
        paymentMethod: "Online",
      },
      {
        user: customers[3]._id,
        items: [
          {
            product: products[21]._id,
            vendor: products[21].vendor,
            name: products[21].name,
            price: products[21].price,
            quantity: 1,
            image: products[21].image,
          },
        ],
        shippingAddress: {
          fullName: "Customer Four",
          address: "15 Station Road",
          city: "Varanasi",
          state: "Uttar Pradesh",
          pincode: "221001",
          phone: "9000000008",
        },
        totalAmount: products[21].price,
        status: "Pending",
        paymentStatus: "Pending",
        paymentMethod: "COD",
      },
    ];

    await Order.insertMany(orders);

    console.log("Seed completed successfully.");
    console.log(`Categories: ${categories.length}`);
    console.log(`Users: ${users.length}`);
    console.log(`Products: ${products.length}`);
    console.log(`Orders: ${orders.length}`);
    console.log(`Reviews: ${reviewTemplates.length}`);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seedDatabase();
