import logger from "../config/logger.js";

// Global error handler middleware
export const errorHandler = (err, req, res, _next) => {
  logger.error({
    err,
    req: { method: req.method, url: req.url },
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      message: "Route not found",
      path: req.originalUrl,
    },
  });
};
