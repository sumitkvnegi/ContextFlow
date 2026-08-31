import express from "express";
import {
  listDocumentsController,
  deleteDocumentController,
  downloadTranscriptController,
} from "../controllers/document.controller.js";

const router = express.Router();

router.get("/documents", listDocumentsController);
router.get("/documents/:id/transcript", downloadTranscriptController);
router.delete("/documents/:id", deleteDocumentController);

export default router;
