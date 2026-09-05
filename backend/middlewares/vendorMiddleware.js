const vendorMiddleware = (req, res, next) => {
  if (req.user.role !== "vendor") {
    return res.status(403).json({ message: "Vendor access only" });
  }
  next();
};
