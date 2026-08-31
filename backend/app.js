import express from "express";
import cors from "cors";
import config from "./src/config/env.js";
import { requestLogger } from "./src/middleware/requestLogger.js";
import {
  errorHandler,
  notFoundHandler,
} from "./src/middleware/errorHandler.js";
import {
  healthRoutes,
  chatRoutes,
  uploadRoutes,
  documentRoutes,
} from "./src/routes/index.js";

const app = express();

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use("/api", healthRoutes);
app.use("/api", chatRoutes);
app.use("/api", uploadRoutes);
app.use("/api", documentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
