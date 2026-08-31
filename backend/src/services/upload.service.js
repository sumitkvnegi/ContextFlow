import path from "path";
import { promises as fs } from "fs";
import { extractPDFFromBuffer } from "./pdf.service.js";
import { transcribeMedia } from "./transcription.service.js";
import { ingestDocuments } from "./ingestion.service.js";
import { UPLOAD_CONSTANTS } from "../config/constants.js";
import logger from "../config/logger.js";

/**
 * Classify an uploaded file into one of: "pdf", "text", "media".
 */
function classifyFile(mimetype, ext) {
  if (mimetype === "application/pdf" || ext === ".pdf") return "pdf";
  if (mimetype?.startsWith("text/") || [".txt", ".md"].includes(ext))
    return "text";
  if (mimetype?.startsWith("audio/") || mimetype?.startsWith("video/"))
    return "media";
  return "unknown";
}

/**
 * Process an uploaded file end-to-end:
 *   1. Extract text (PDF/TXT/MD) or transcribe (audio/video)
 *   2. Chunk + embed + store in Qdrant
 *
 * @param {{buffer:Buffer, originalname:string, mimetype:string}} file
 * @returns {Promise<{title, source, type, contentLength, chunksCreated, transcript?}>}
 */
export async function processUpload(file) {
  const { buffer, originalname, mimetype } = file;
  const ext = path.extname(originalname).toLowerCase();
  const kind = classifyFile(mimetype, ext);

  if (kind === "unknown") {
    throw Object.assign(
      new Error(
        "Unsupported file type. Upload a PDF, TXT, MD, audio, or video file.",
      ),
      { statusCode: 400 },
    );
  }

  logger.info({ originalname, mimetype, kind }, "Processing upload");

  let title = originalname;
  let content;
  let transcript;
  let transcriptFile;

  if (kind === "pdf") {
    const pdf = await extractPDFFromBuffer(buffer, originalname);
    title = pdf.title;
    content = pdf.content;
  } else if (kind === "text") {
    content = buffer.toString("utf-8").replace(/\r\n/g, "\n").trim();
  } else {
    // media → transcribe to text
    content = await transcribeMedia(buffer, originalname);
    transcript = content;

    // Persist the transcript so the user can download it later.
    const safeName = path
      .parse(originalname)
      .name.replace(/[^a-zA-Z0-9]/g, "_");
    transcriptFile = `${Date.now()}_${safeName}.txt`;
    await fs.mkdir(UPLOAD_CONSTANTS.DOCUMENTS_DIR, { recursive: true });
    await fs.writeFile(
      path.join(UPLOAD_CONSTANTS.DOCUMENTS_DIR, transcriptFile),
      content,
      "utf-8",
    );
  }

  if (!content || content.length < UPLOAD_CONSTANTS.MIN_CONTENT_LENGTH) {
    throw Object.assign(
      new Error(
        `Extracted too little text from "${originalname}" (${content?.length || 0} chars).`,
      ),
      { statusCode: 422 },
    );
  }

  const doc = {
    title,
    content,
    metadata: {
      source: originalname,
      title,
      documentType: kind === "media" ? "transcript" : `${kind}_upload`,
      category: "upload",
      ingestedAt: new Date().toISOString(),
    },
  };

  const result = await ingestDocuments([doc]);

  return {
    title,
    source: originalname,
    type: kind,
    contentLength: content.length,
    chunksCreated: result.chunksCreated,
    ...(transcript ? { transcript } : {}),
    ...(transcriptFile ? { transcriptFile } : {}),
  };
}
