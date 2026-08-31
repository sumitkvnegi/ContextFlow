import multer from "multer";
import { processUpload } from "../services/upload.service.js";
import { addDocument, findBySource } from "../services/registry.service.js";
import { UPLOAD_CONSTANTS } from "../config/constants.js";
import logger from "../config/logger.js";

/**
 * Keep uploads in memory — we parse/transcribe them immediately.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: UPLOAD_CONSTANTS.MAX_FILE_SIZE },
});

/**
 * POST /api/upload  (multipart/form-data, field name: "file")
 * Accepts PDF/TXT/MD or audio/video. Extracts/transcribes text and stores
 * embeddings so the content becomes queryable via chat.
 */
export const uploadController = async (req, res) => {
  if (!req.file) {
    const error = new Error("No file uploaded (expected form field 'file')");
    error.statusCode = 400;
    throw error;
  }

  logger.info(
    { name: req.file.originalname, size: req.file.size },
    "Received upload request",
  );

  // Reject duplicates up-front (by filename) so we don't waste time
  // parsing/transcribing a document that is already ingested.
  const existing = await findBySource(req.file.originalname);
  if (existing) {
    const error = new Error(
      `"${req.file.originalname}" has already been uploaded. Delete the existing document first if you want to re-upload it.`,
    );
    error.statusCode = 409;
    throw error;
  }

  const startedAt = Date.now();
  const result = await processUpload(req.file);
  const processingMs = Date.now() - startedAt;

  // Register the document so it appears in the sidebar and can be selected
  // as a RAG filter for future chats.
  const document = await addDocument({
    source: result.source,
    title: result.title,
    type: result.type,
    sizeBytes: req.file.size,
    contentLength: result.contentLength,
    chunksCreated: result.chunksCreated,
    processingMs,
    status: "ready",
    ...(result.transcriptFile ? { transcriptFile: result.transcriptFile } : {}),
  });

  const noun = result.type === "media" ? "transcript" : "document";
  return res.json({
    success: true,
    message: `Ingested "${result.title}" as a ${noun} (${result.chunksCreated} chunks).`,
    result: { ...result, processingMs },
    document,
  });
};
