export const RAG_CONSTANTS = {
  QDRANT_URL: process.env.QDRANT_URL || "http://localhost:6333",
  COLLECTION_NAME: "rag_documents",
  VECTOR_SIZE: 768, // nomic-embed-text vector dimension
  VECTOR_DISTANCE: "Cosine",

  // ===== Retrieval pipeline =====
  CANDIDATE_POOL: 20,
  DEFAULT_K: 5,
  MAX_K: 8,
  MAX_PER_SOURCE: 4,
  MIN_SIMILARITY_SCORE: 0.6,
  USE_MMR: true,
  MMR_LAMBDA: 0.6,

  // ===== Chunking settings =====
  CHUNK_SIZE: 1200,
  CHUNK_OVERLAP: 200,

  // ===== nomic-embed-text task prefixes (required by the model) =====
  EMBED_DOCUMENT_PREFIX: "search_document: ",
  EMBED_QUERY_PREFIX: "search_query: ",

  // Payload fields to index in Qdrant for metadata filtering
  INDEXED_PAYLOAD_FIELDS: ["source", "category", "documentType"],
};

export const LLM_CONSTANTS = {
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  CHAT_MODEL: process.env.OLLAMA_MODEL || "llama3.2:1b",
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || "nomic-embed-text",
  TEMPERATURE: 0.15,
  TIMEOUT: 30000,
};

// ===== File Upload Constants =====
export const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 25 * 1024 * 1024,
  MIN_CONTENT_LENGTH: 50,
  DOCUMENTS_DIR: "documents",
};

// ===== Transcription Constants =====
export const TRANSCRIPTION_CONSTANTS = {
  METHOD: process.env.TRANSCRIPTION_METHOD || "local",
  WHISPER_MODEL: "tiny.en",
  OPENAI_MODEL: "whisper-1",
  LANGUAGE: "en",
};
