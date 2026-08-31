import express from "express";
import { upload, uploadController } from "../controllers/upload.controller.js";

const router = express.Router();

// Upload a document (PDF/TXT/MD) or audio/video (transcribed), then ingest.
router.post("/upload", upload.single("file"), uploadController);

export default router;
