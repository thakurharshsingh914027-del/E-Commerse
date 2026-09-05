
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    extraDetails: err.extraDetails || "Error from backend",
  });
};

module.exports = errorMiddleware;




// module.exports = errorMiddleware;
