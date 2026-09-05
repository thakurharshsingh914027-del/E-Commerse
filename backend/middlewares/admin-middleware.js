// const adminMiddleware = (req, res, next) => {
//   if (!req.user || req.user.role !== "admin") {
//     return res.status(403).json({ message: "Admin access required" });
//   }
//   next();
// };

// module.exports = adminMiddleware;
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: No user found" });
  }

  // Normalize to lowercase to avoid "Admin" vs "admin" issues
  const userRole = req.user.role ? req.user.role.toLowerCase() : "";

  // Allow both 'admin' and your current 'super_admin' role
  if (userRole === "admin" || userRole === "super_admin") {
    next();
  } else {
    return res.status(403).json({ 
      message: `Access denied. Role '${req.user.role}' does not have admin privileges.` 
    });
  }
};

module.exports = adminMiddleware;

