import path from "path";
import { promises as fs } from "fs";
import {
  listDocuments,
  removeDocument,
  getDocument,
} from "../services/registry.service.js";
import { deleteBySource } from "../services/ingestion.service.js";
import { UPLOAD_CONSTANTS } from "../config/constants.js";
import logger from "../config/logger.js";

// GET /api/documents — list all uploaded documents (newest first).
export const listDocumentsController = async (req, res) => {
  const documents = await listDocuments();
  return res.json({ success: true, documents });
};

export const downloadTranscriptController = async (req, res) => {
  const { id } = req.params;
  const doc = await getDocument(id);

  if (!doc || !doc.transcriptFile) {
    const error = new Error("No transcript available for this document");
    error.statusCode = 404;
    throw error;
  }

  const filePath = path.join(
    UPLOAD_CONSTANTS.DOCUMENTS_DIR,
    path.basename(doc.transcriptFile),
  );

  try {
    await fs.access(filePath);
  } catch {
    const error = new Error("Transcript file not found on disk");
    error.statusCode = 404;
    throw error;
  }

  const downloadName = `${path.parse(doc.source).name}.txt`;
  return res.download(filePath, downloadName);
};

/**
 * DELETE /api/documents/:id — remove a document from the registry and delete
 * its vectors from Qdrant so it no longer participates in retrieval.
 */
export const deleteDocumentController = async (req, res) => {
  const { id } = req.params;

  const removed = await removeDocument(id);
  if (!removed) {
    const error = new Error("Document not found");
    error.statusCode = 404;
    throw error;
  }

  try {
    await deleteBySource(removed.source);
  } catch (err) {
    logger.warn(
      { err: err.message, source: removed.source },
      "Failed to delete vectors (non-fatal)",
    );
  }

  if (removed.transcriptFile) {
    try {
      await fs.unlink(
        path.join(
          UPLOAD_CONSTANTS.DOCUMENTS_DIR,
          path.basename(removed.transcriptFile),
        ),
      );
    } catch {
      // Ignore errors
    }
  }

  return res.json({ success: true, removed });
};
