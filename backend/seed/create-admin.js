require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const connectDB = require("../utils/db");
const User = require("../models/user-model");

const DEFAULT_ADMIN = {
  username: process.env.ADMIN_NAME || "Admin User",
  email: (process.env.ADMIN_EMAIL || "admin@shophub.com").toLowerCase().trim(),
  phone: process.env.ADMIN_PHONE || "9000000001",
  password: process.env.ADMIN_PASSWORD || "password123",
  role: "admin",
  isApproved: true,
};

async function createAdmin() {
  await connectDB();

  try {
    const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN.email });

    if (existingAdmin) {
      if (existingAdmin.role !== "admin" || !existingAdmin.isApproved) {
        existingAdmin.username = DEFAULT_ADMIN.username;
        existingAdmin.phone = DEFAULT_ADMIN.phone;
        existingAdmin.role = "admin";
        existingAdmin.isApproved = true;

        if (DEFAULT_ADMIN.password) {
          existingAdmin.password = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
        }

        await existingAdmin.save();
        console.log(`Admin account updated: ${existingAdmin.email}`);
      } else {
        console.log(`Admin account already exists: ${existingAdmin.email}`);
      }

      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

    const admin = await User.create({
      username: DEFAULT_ADMIN.username,
      email: DEFAULT_ADMIN.email,
      phone: DEFAULT_ADMIN.phone,
      password: hashedPassword,
      role: DEFAULT_ADMIN.role,
      isApproved: DEFAULT_ADMIN.isApproved,
    });

    console.log(`Admin account created: ${admin.email}`);
  } catch (error) {
    console.error("Create admin failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

createAdmin();
