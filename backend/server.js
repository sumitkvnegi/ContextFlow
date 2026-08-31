import app from "./app.js";
import config from "./src/config/env.js";
import logger from "./src/config/logger.js";
import { initializeCollection } from "./src/config/qdrant.js";

const PORT = config.port;

let server;

async function startServer() {
  try {
    await initializeCollection();

    server = app.listen(PORT, () => {
      logger.info(`🚀 RAG Transcriber API running on port ${PORT}`);
      logger.info(`📝 Environment: ${config.nodeEnv}`);
      logger.info(`🌐 CORS origin: ${config.corsOrigin}`);
      logger.info(`✅ Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
}

async function shutdown(signal) {
  logger.info(`${signal} received: shutting down gracefully`);

  const forceExit = setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();

  try {
    if (server) {
      await new Promise((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve())),
      );
      logger.info("HTTP server closed");
    }
    clearTimeout(forceExit);
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "Error during shutdown");
    process.exit(1);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();
