import logger from "../config/logger.js";

/**
 * Log each incoming request and its response time.
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        durationMs: Date.now() - start,
      },
      "request handled",
    );
  });

  next();
};
