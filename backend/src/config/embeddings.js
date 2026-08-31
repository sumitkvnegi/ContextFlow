import { OllamaEmbeddings } from "@langchain/ollama";
import { LLM_CONSTANTS, RAG_CONSTANTS } from "./constants.js";

export class PrefixedOllamaEmbeddings extends OllamaEmbeddings {
  constructor(fields = {}) {
    super(fields);
    this.documentPrefix =
      fields.documentPrefix ?? RAG_CONSTANTS.EMBED_DOCUMENT_PREFIX;
    this.queryPrefix = fields.queryPrefix ?? RAG_CONSTANTS.EMBED_QUERY_PREFIX;
  }

  async embedDocuments(texts) {
    const prefixed = texts.map((t) => `${this.documentPrefix}${t}`);
    return super.embedDocuments(prefixed);
  }

  async embedQuery(text) {
    return super.embedQuery(`${this.queryPrefix}${text}`);
  }
}

export const embeddings = new PrefixedOllamaEmbeddings({
  model: LLM_CONSTANTS.EMBEDDING_MODEL,
  baseUrl: LLM_CONSTANTS.OLLAMA_BASE_URL,
});

export default embeddings;
