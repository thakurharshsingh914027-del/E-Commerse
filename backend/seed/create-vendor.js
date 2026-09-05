require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const connectDB = require("../utils/db");
const Category = require("../models/Category");
const User = require("../models/user-model");

const DEFAULT_VENDOR = {
  username: process.env.VENDOR_NAME || "Tech Vendor Four",
  email: (process.env.VENDOR_EMAIL || "vendor4@shophub.com").toLowerCase().trim(),
  phone: process.env.VENDOR_PHONE || "9000000010",
  password: process.env.VENDOR_PASSWORD || "vendor123",
  categoryName: (process.env.VENDOR_CATEGORY || "networking").toLowerCase().trim(),
  role: "vendor",
  isApproved: true,
};

async function createVendor() {
  await connectDB();

  try {
    const category = await Category.findOne({ name: DEFAULT_VENDOR.categoryName });

    if (!category) {
      throw new Error(`Category not found: ${DEFAULT_VENDOR.categoryName}`);
    }

    const existingVendor = await User.findOne({ email: DEFAULT_VENDOR.email });

    if (existingVendor) {
      existingVendor.username = DEFAULT_VENDOR.username;
      existingVendor.phone = DEFAULT_VENDOR.phone;
      existingVendor.role = "vendor";
      existingVendor.isApproved = DEFAULT_VENDOR.isApproved;
      existingVendor.assignedCategory = category._id;

      if (DEFAULT_VENDOR.password) {
        existingVendor.password = await bcrypt.hash(DEFAULT_VENDOR.password, 10);
      }

      await existingVendor.save();
      console.log(`Vendor account updated: ${existingVendor.email}`);
      console.log(`Assigned category: ${DEFAULT_VENDOR.categoryName}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_VENDOR.password, 10);

    const vendor = await User.create({
      username: DEFAULT_VENDOR.username,
      email: DEFAULT_VENDOR.email,
      phone: DEFAULT_VENDOR.phone,
      password: hashedPassword,
      role: DEFAULT_VENDOR.role,
      isApproved: DEFAULT_VENDOR.isApproved,
      assignedCategory: category._id,
    });

    console.log(`Vendor account created: ${vendor.email}`);
    console.log(`Assigned category: ${DEFAULT_VENDOR.categoryName}`);
  } catch (error) {
    console.error("Create vendor failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

createVendor();
