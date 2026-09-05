// exports.isVendor = (req, res, next) => {
//   if (req.user.role !== "vendor") {
//     return res.status(403).json({ message: "Vendor access only" });
//   }
//   next();
// };
// backend/middlewares/role-middleware.js
// backend/middlewares/role-middleware.js

const isVendor = (req, res, next) => {
  // 1. Check if user exists
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: No user found" });
  }

  // 2. Check for the boolean 'isVendor' OR the string 'role' OR 'isAdmin'
  const hasVendorAccess = 
    req.user.isVendor === true || 
    req.user.role === "vendor" || 
    req.user.isAdmin === true;

  if (hasVendorAccess) {
    next();
  } else {
    // If we reach here, the user is definitely not a vendor
    res.status(403).json({ message: "Vendor access required" });
  }
};

module.exports = { isVendor };