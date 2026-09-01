import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings, qdrantClient, COLLECTION_NAME } from "../config/qdrant.js";
import { RAG_CONSTANTS } from "../config/constants.js";
import logger from "../config/logger.js";

// Derive a human-friendly document title (first non-empty line).
function extractDocTitle(content) {
  const firstLine = content
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  return firstLine ? firstLine.replace(/^#+\s*/, "").slice(0, 200) : "Untitled";
}

// Split text into sections keyed by their nearest markdown heading so a
// section's context stays attached to its content.
function splitIntoSections(content) {
  const lines = content.split("\n");
  const sections = [];
  let currentHeading = "Overview";
  let buffer = [];

  const flush = () => {
    const text = buffer.join("\n").trim();
    if (text.length > 0) sections.push({ heading: currentHeading, text });
    buffer = [];
  };

  for (const line of lines) {
    const headingMatch = line.match(/^\s*(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flush();
      currentHeading = headingMatch[2].trim();
    } else {
      buffer.push(line);
    }
  }
  flush();

  return sections.length > 0
    ? sections
    : [{ heading: "Overview", text: content }];
}

// Split a document into heading-aware chunks and enrich metadata.
export async function chunkDocument(document) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: RAG_CONSTANTS.CHUNK_SIZE,
    chunkOverlap: RAG_CONSTANTS.CHUNK_OVERLAP,
    separators: ["\n## ", "\n### ", "\n\n", "\n", ". ", " ", ""],
  });

  const title = extractDocTitle(document.content);
  const sections = splitIntoSections(document.content);
  const allChunks = [];

  for (const section of sections) {
    const sectionMeta = {
      ...document.metadata,
      title,
      heading: section.heading,
    };

    const chunks = await splitter.createDocuments(
      [section.text],
      [sectionMeta],
    );

    // Prepend the heading so the embedding captures section context.
    for (const chunk of chunks) {
      chunk.pageContent = `## ${section.heading}\n${chunk.pageContent}`;
    }

    allChunks.push(...chunks);
  }

  return allChunks;
}

export async function ingestDocuments(documents) {
  const allChunks = [];
  for (const doc of documents) {
    const chunks = await chunkDocument(doc);
    allChunks.push(...chunks);
    logger.info(
      { source: doc.metadata?.source, chunks: chunks.length },
      "Document chunked",
    );
  }

  await QdrantVectorStore.fromDocuments(allChunks, embeddings, {
    client: qdrantClient,
    collectionName: COLLECTION_NAME,
  });

  logger.info({ chunks: allChunks.length }, "Documents ingested into Qdrant");

  return {
    success: true,
    documentsProcessed: documents.length,
    chunksCreated: allChunks.length,
  };
}

export async function deleteBySource(source) {
  await qdrantClient.delete(COLLECTION_NAME, {
    filter: {
      must: [{ key: "metadata.source", match: { value: source } }],
    },
  });
  logger.info({ source }, "Deleted document vectors from Qdrant");
}
