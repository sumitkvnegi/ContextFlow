import express from "express";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "RAG Transcriber API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

export default router;
