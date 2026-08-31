import { QdrantClient } from "@qdrant/js-client-rest";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RAG_CONSTANTS } from "./constants.js";
import { embeddings } from "./embeddings.js";
import logger from "./logger.js";

const QDRANT_URL = RAG_CONSTANTS.QDRANT_URL;
const COLLECTION_NAME = RAG_CONSTANTS.COLLECTION_NAME;

export const qdrantClient = new QdrantClient({ url: QDRANT_URL });

export { embeddings, COLLECTION_NAME };

export async function getVectorStore() {
  return await QdrantVectorStore.fromExistingCollection(embeddings, {
    client: qdrantClient,
    collectionName: COLLECTION_NAME,
  });
}

/**
 * Create payload indexes so metadata fields can be used for fast filtering.
 * Safe to call repeatedly — existing indexes are ignored.
 */
export async function ensurePayloadIndexes() {
  for (const field of RAG_CONSTANTS.INDEXED_PAYLOAD_FIELDS) {
    try {
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: `metadata.${field}`,
        field_schema: "keyword",
      });
    } catch {
      // Index already exists or field not present yet — ignore.
    }
  }
}

export async function initializeCollection() {
  const collections = await qdrantClient.getCollections();
  const exists = collections.collections.some(
    (col) => col.name === COLLECTION_NAME,
  );

  if (!exists) {
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: RAG_CONSTANTS.VECTOR_SIZE,
        distance: RAG_CONSTANTS.VECTOR_DISTANCE,
      },
    });
    logger.info(`Created Qdrant collection: ${COLLECTION_NAME}`);
  } else {
    logger.info(`Qdrant collection already exists: ${COLLECTION_NAME}`);
  }

  await ensurePayloadIndexes();
}
