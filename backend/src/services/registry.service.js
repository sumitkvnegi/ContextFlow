import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { UPLOAD_CONSTANTS } from "../config/constants.js";
import logger from "../config/logger.js";

const REGISTRY_PATH = path.join(
  UPLOAD_CONSTANTS.DOCUMENTS_DIR,
  "registry.json",
);

let cache = null;

async function ensureDir() {
  await fs.mkdir(UPLOAD_CONSTANTS.DOCUMENTS_DIR, { recursive: true });
}

async function load() {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(REGISTRY_PATH, "utf-8");
    cache = JSON.parse(raw);
  } catch {
    cache = [];
  }
  return cache;
}

async function persist() {
  await ensureDir();
  await fs.writeFile(REGISTRY_PATH, JSON.stringify(cache, null, 2), "utf-8");
}

export async function listDocuments() {
  const docs = await load();
  return [...docs].sort(
    (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt),
  );
}

export async function getDocument(id) {
  const docs = await load();
  return docs.find((d) => d.id === id) || null;
}

// Find a document by its source filename (case-insensitive). Used to prevent uploading the same document twice.
export async function findBySource(source) {
  if (!source) return null;
  const docs = await load();
  const needle = String(source).trim().toLowerCase();
  return docs.find((d) => (d.source || "").toLowerCase() === needle) || null;
}

export async function addDocument(record) {
  const docs = await load();
  const entry = {
    id: randomUUID(),
    uploadedAt: new Date().toISOString(),
    ...record,
  };
  docs.push(entry);
  cache = docs;
  await persist();
  logger.info({ id: entry.id, source: entry.source }, "Document registered");
  return entry;
}

export async function removeDocument(id) {
  const docs = await load();
  const idx = docs.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  const [removed] = docs.splice(idx, 1);
  cache = docs;
  await persist();
  return removed;
}
