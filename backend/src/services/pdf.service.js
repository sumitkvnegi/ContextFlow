import { PDFParse } from "pdf-parse";
import logger from "../config/logger.js";

/**
 * Extract text from a raw PDF Buffer (an uploaded file).
 * @param {Buffer} pdfBuffer
 * @param {string} [label] - A name used for logging & title fallback.
 * @returns {Promise<{title, content, metadata}>}
 */
export async function extractPDFFromBuffer(pdfBuffer, label = "uploaded.pdf") {
  logger.info({ label, size: pdfBuffer.length }, "Extracting text from PDF");

  const parser = new PDFParse({ data: pdfBuffer });
  try {
    const textResult = await parser.getText();
    const cleanedText = cleanPDFText(textResult.text);

    return {
      title: extractTitleFromPDF(textResult.text) || label,
      content: cleanedText,
      metadata: {
        pages: textResult.pages.length,
        rawTextLength: textResult.text.length,
        cleanedTextLength: cleanedText.length,
      },
    };
  } finally {
    await parser.destroy();
  }
}

/**
 * Normalize PDF text: collapse whitespace, drop page-number noise.
 */
function cleanPDFText(text) {
  if (!text) return "";
  return text
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/Page \d+ of \d+/gi, "")
    .replace(/\f/g, "")
    .trim();
}

/**
 * Use the first non-empty line as a title.
 */
function extractTitleFromPDF(text) {
  if (!text) return "Untitled PDF";
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length === 0) return "Untitled PDF";
  return lines[0].trim().substring(0, 200) || "Untitled PDF";
}
