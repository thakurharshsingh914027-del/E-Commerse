const User = require("../models/user-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= HOME =================
const home = async (req, res) => {
  return res.status(200).send("API Running...");
};

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const { username, email, phone, password, role, assignedCategory } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      role: role || "customer",
      assignedCategory: role === "vendor" ? assignedCategory : null, 
      // isApproved will automatically set itself based on your schema's default function
    });

    return res.status(201).json({
      success: true,
      message: newUser.role === "vendor"
          ? "Vendor registered. Waiting for admin approval."
          : "User registered successfully",
      user: { id: newUser._id, role: newUser.role, isApproved: newUser.isApproved }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 🔥 normalize email
    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Block unapproved vendors
    if (user.role === "vendor" && !user.isApproved) {
      return res.status(403).json({
        message: "Vendor account pending admin approval",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,  
      },
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// ================= GET LOGGED USER =================
// ================= GET LOGGED USER =================
const getLoggedInUser = async (req, res) => {
  try {
    // req.user is already attached by your authMiddleware
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user object inside a 'user' key
    res.status(200).json({ 
      success: true, 
      user: req.user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ================= ADMIN: GET ALL VENDORS =================
const getAllVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" }).select("-password");
    return res.status(200).json(vendors);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ================= ADMIN: APPROVE / REJECT =================
const updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const vendor = await User.findById(id);

    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.isApproved = isApproved;
    await vendor.save();

    return res.status(200).json({
      success: true,
      message: `Vendor ${isApproved ? "approved" : "rejected"} successfully`,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ================= ADMIN: DELETE =================
const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await User.findById(id);

    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await vendor.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
// Add this to auth-controller.js
const assignVendorCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedCategory } = req.body;

    const vendor = await User.findByIdAndUpdate(
        id, 
        { assignedCategory }, 
        { new: true }
    );

    res.status(200).json({ 
        message: `Vendor assigned to ${assignedCategory}`, 
        vendor 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  home,
  register,
  login,
  getLoggedInUser,
  getAllVendors,
  updateVendorStatus,
  deleteVendor,
  assignVendorCategory
};


// const User = require("../models/user-model");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const Admin = require("../models/Admin");

// // ================= HOME =================
// const home = async (req, res, next) => {
//   try {
//     return res.status(200).send("Hello World!");
//   } catch (error) {
//     next(error);
//   }
// };

// // ================= REGISTER =================
// const register = async (req, res, next) => {
//   try {
//     const { username, email, phone, password } = req.body;
//     const role = req.body.role?.toLowerCase() || "customer";

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await User.create({
//       username,
//       email,
//       phone,
//       password: hashedPassword,
//       role,
//       isApproved: role === "vendor" ? false : true,
//     });

//     return res.status(201).json({
//       success: true,
//       message:
//         role === "vendor"
//           ? "Vendor registered. Waiting for admin approval."
//           : "User registered successfully",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ================= LOGIN (USER/VENDOR) =================
// const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     // Block unapproved vendors
//     if (user.role === "vendor" && !user.isApproved) {
//       return res.status(403).json({
//         message: "Vendor account pending admin approval",
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ================= GET LOGGED-IN USER =================
// const user = async (req, res) => {
//   try {
//     return res.status(200).json(req.user);
//   } catch (error) {
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // ================= ADMIN LOGIN =================
// const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: admin._id, role: "admin" },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Admin login successful",
//       token,
//       role: "admin",
//     });
//   } catch (error) {
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // ================= GET ALL VENDORS (ADMIN ONLY) =================
// const getAllVendors = async (req, res, next) => {
//   try {
//     const vendors = await User.find({ role: "vendor" }).select("-password");

//     // ✅ Always return 200 with array (even if empty)
//     return res.status(200).json(vendors);
//   } catch (error) {
//     next(error);
//   }
// };

// // ================= UPDATE VENDOR STATUS =================
// const updateVendorStatus = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { isApproved } = req.body;

//     const updatedVendor = await User.findByIdAndUpdate(
//       id,
//       { isApproved },
//       { new: true }
//     ).select("-password");

//     if (!updatedVendor) {
//       return res.status(404).json({ message: "Vendor not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       message: `Vendor status updated to ${
//         isApproved ? "Approved" : "Pending"
//       }`,
//       updatedVendor,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ================= DELETE VENDOR =================
// const deleteVendor = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const deleted = await User.findByIdAndDelete(id);

//     if (!deleted) {
//       return res.status(404).json({ message: "Vendor not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Vendor deleted successfully",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   home,
//   register,
//   login,
//   user,
//   adminLogin,
//   getAllVendors,
//   updateVendorStatus,
//   deleteVendor,
// };

// const User = require('../models/user-model');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const Admin = require("../models/Admin");

// // ================= HOME =================
// const home = async (req, res, next) => {
//   try {
//     return res.status(200).send('Hello World!');
//   } catch (error) {
//     next(error);
//   }
// };

// // ================= REGISTER =================
// const register = async (req, res, next) => {
//   try {
//     const { username, email, phone, password } = req.body;
//     const role = req.body.role?.toLowerCase() || "customer";

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await User.create({
//       username,
//       email,
//       phone,
//       password: hashedPassword,
//       role,
//       isApproved: role === "vendor" ? false : true
//     });

//     return res.status(201).json({
//       success: true,
//       message: role === "vendor"
//           ? "Vendor registered. Waiting for admin approval."
//           : "User registered successfully"
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ================= LOGIN (USER/VENDOR) =================
// const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     // Block unapproved vendors
//     if (user.role === "vendor" && !user.isApproved) {
//       return res.status(403).json({
//         message: "Vendor account pending admin approval"
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         phone: user.phone,
//         role: user.role
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ================= GET LOGGED-IN USER =================
// const user = async (req, res) => {
//   try {
//     return res.status(200).json(req.user);
//   } catch (error) {
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // ================= ADMIN LOGIN =================
// const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Explicitly set role to "admin" in payload to pass adminMiddleware
//     const token = jwt.sign(
//       { id: admin._id, role: "admin" },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Admin login successful",
//       token,
//       role: "admin"
//     });
//   } catch (error) {
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // ================= GET ALL VENDORS (ADMIN ONLY) =================
// const getAllVendors = async (req, res, next) => {
//   try {
//     const vendors = await User.find({ role: "vendor" }).select("-password");
    
//     if (!vendors || vendors.length === 0) {
//       return res.status(404).json({ message: "No vendors found" });
//     }
    
//     return res.status(200).json(vendors);
//   } catch (error) {
//     next(error);
//   }
// };

// // ================= APPROVE/REJECT VENDOR =================
// const updateVendorStatus = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { isApproved } = req.body;

//     const updatedVendor = await User.findByIdAndUpdate(
//       id,
//       { isApproved },
//       { new: true }
//     ).select("-password");

//     if (!updatedVendor) {
//       return res.status(404).json({ message: "Vendor not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       message: `Vendor status updated to ${isApproved ? "Approved" : "Pending"}`,
//       updatedVendor
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   home,
//   register,
//   login,
//   user,
//   adminLogin,
//   getAllVendors,
//   updateVendorStatus
// };
// const User = require('../models/user-model');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const Admin = require("../models/Admin");

// // ================= HOME =================
// const home = async (req, res, next) => {
//   try {
//     return res.status(200).send('Hello World!');
//   } catch (error) {
//     next(error);
//   }
// };

// // ================= REGISTER =================
// const register = async (req, res, next) => {
//   try {
//     const { username, email, phone, password } = req.body;
//     const role = req.body.role?.toLowerCase() || "customer";

//     // Check existing user
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create user
//     await User.create({
//       username,
//       email,
//       phone,
//       password: hashedPassword,
//       role,
//       isApproved: role === "vendor" ? false : true
//     });

//     return res.status(201).json({
//       success: true,
//       message:
//         role === "vendor"
//           ? "Vendor registered. Waiting for admin approval."
//           : "User registered successfully"
//     });

//   } catch (error) {
//     next(error);
//   }
// };

// // ================= LOGIN =================
// const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     // Block unapproved vendors
//     if (user.role === "vendor" && !user.isApproved) {
//       return res.status(403).json({
//         message: "Vendor account pending admin approval"
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     // JWT Token
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         phone: user.phone,
//         role: user.role
//       }
//     });

//   } catch (error) {
//     next(error);
//   }
// };

// // ================= GET LOGGED-IN USER =================
// const user = async (req, res) => {
//   try {
//     return res.status(200).json(req.user);
//   } catch (error) {
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // ================= ADMIN LOGIN =================
// const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: admin._id, role: "admin" },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Admin login successful",
//       token,
//       role: "admin"
//     });

//   } catch (error) {
//     return res.status(500).json({ message: "Server error" });
//   }
// };
// // ================= GET ALL VENDORS (ADMIN ONLY) =================
// const getAllVendors = async (req, res, next) => {
//   try {
//     // Find all users where role is vendor, exclude password for security
//     const vendors = await User.find({ role: "vendor" }).select("-password");
    
//     if (!vendors) {
//       return res.status(404).json({ message: "No vendors found" });
//     }
    
//     return res.status(200).json(vendors);
//   } catch (error) {
//     next(error);
//   }
// };

// // ================= APPROVE/REJECT VENDOR =================
// const updateVendorStatus = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { isApproved } = req.body;

//     const updatedVendor = await User.findByIdAndUpdate(
//       id,
//       { isApproved },
//       { new: true }
//     ).select("-password");

//     if (!updatedVendor) {
//       return res.status(404).json({ message: "Vendor not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       message: `Vendor status updated to ${isApproved ? "Approved" : "Pending"}`,
//       updatedVendor
//     });
//   } catch (error) {
//     next(error);
//   }
// };
// // ================= EXPORT =================
// module.exports = {
//   home,
//   register,
//   login,
//   user,
//   adminLogin,
//   getAllVendors,      // Add this
//   updateVendorStatus
// };

// const User = require('../models/user-model');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const Admin = require("../models/Admin");

// // HOME
// const home = async (req, res, next) => {
//   try {
//     return res.status(200).send('Hello World!');
//   } catch (error) {
//     next(error);
//   }
// };

// // REGISTER
// const register = async (req, res, next) => {
//   try {
//     const { username, email, phone, password, role } = req.body;

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = await User.create({
//       username,
//       email,
//       phone,
//       password: hashedPassword,
//       role: role || "customer",
//       isApproved: role === "vendor" ? false : true
//     });

//     return res.status(201).json({
//       success: true,
//       message:
//         role === "vendor"
//           ? "Vendor registered. Waiting for admin approval."
//           : "User registered successfully"
//     });

//   } catch (error) {
//     next(error);
//   }
// };

// // LOGIN
// const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     // ❌ BLOCK UNAPPROVED VENDORS
//     if (user.role === "vendor" && !user.isApproved) {
//       return res.status(403).json({
//         message: "Vendor account pending admin approval"
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         phone: user.phone,
//         role: user.role
//       }
//     });

//   } catch (error) {
//     next(error);
//   }
// };

// // GET LOGGED-IN USER
// const user = async (req, res) => {
//   try {
//     return res.status(200).json(req.user);
//   } catch (error) {
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // ADMIN LOGIN
// const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: admin._id, role: "admin" },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Admin login successful",
//       token,
//       role: "admin"
//     });

//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// module.exports = { home, register, login, user, adminLogin };

// const User = require('../models/user-model');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { CURSOR_FLAGS } = require('mongodb');

// const Admin = require("../models/Admin");


// // HOME
// const home = async (req, res, next) => {
//   try {
//     return res.status(200).send('Hello World!');
//   } catch (error) {
//     next(error);
//   }
// };

// // REGISTER
// const register = async (req, res, next) => {
//   try {
//     const { username, email, phone, password } = req.body;

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       const err = new Error("User already exists");
//       err.statusCode = 400;
//       throw err;
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const userCreated = await User.create({
//       username,
//       email,
//       phone,
//       password: hashedPassword,
//     });

//     // return res.status(201).json({ user: userCreated });
//     return res.status(201).json({
//       success: true,
//       message: "User registered successfully"
//     });


//   } catch (error) {
//     next(error);
//   }
// };

// // LOGIN
// const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       const err = new Error("Email and password are required");
//       err.statusCode = 400;
//       throw err;
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       const err = new Error("Invalid email or password");
//       err.statusCode = 401;
//       throw err;
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       const err = new Error("Invalid email or password");
//       err.statusCode = 401;
//       throw err;
//     }

//     const token = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );
//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         phone: user.phone   // ✅ ADD THIS
//       }
//     });

//     // return res.status(200).json({
//     //   success: true,
//     //   message: "Login successful",
//     //   token,
//     //   user: {
//     //     id: user._id,
//     //     username: user.username,
//     //     email: user.email
//     //   }
//     // });

//   } catch (error) {
//     next(error);
//   }
// };

// const user = async (req, res) => {
//   try {
//     return res.status(200).json(req.user);
//   } catch (error) {
//     return res.status(500).json({ message: "Server error" });
//   }
// };
// // ADMIN LOGIN
// const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: admin._id, role: "admin" },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.status(200).json({
//       success: true,
//       message: "Admin login successful",
//       token,
//       role: "admin"
//     });

//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };



// module.exports = { home, register, login, user, adminLogin };

