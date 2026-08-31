import { RAG_CONSTANTS } from "../config/constants.js";

/**
 * Cosine similarity between two equal-length vectors.
 */
export function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function normalizeForDedup(text) {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

export function deduplicate(candidates) {
  const seen = new Map();
  for (const cand of candidates) {
    const key = normalizeForDedup(cand.doc.pageContent).slice(0, 200);
    const existing = seen.get(key);
    if (!existing || cand.score > existing.score) {
      seen.set(key, cand);
    }
  }
  return [...seen.values()];
}

// Prevents one source document from dominating the results.
export function capPerSource(candidates, maxPerSource) {
  const counts = new Map();
  const kept = [];
  for (const cand of candidates) {
    const source = cand.doc.metadata?.source || "unknown";
    const count = counts.get(source) || 0;
    if (count < maxPerSource) {
      counts.set(source, count + 1);
      kept.push(cand);
    }
  }
  return kept;
}

const STOPWORDS = new Set([
  "the",
  "is",
  "a",
  "an",
  "of",
  "for",
  "to",
  "in",
  "on",
  "and",
  "or",
  "what",
  "which",
  "who",
  "whom",
  "how",
  "when",
  "where",
  "why",
  "are",
  "do",
  "does",
  "did",
  "can",
  "could",
  "should",
  "would",
  "with",
  "about",
  "this",
  "that",
  "these",
  "those",
  "be",
  "as",
  "at",
  "by",
  "from",
  "it",
]);

function queryTerms(queryText) {
  return (queryText || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

/**
 * Lexical (keyword-overlap) boost — a cheap hybrid-search signal. Heading
 * matches are weighted higher than body matches.
 */
export function lexicalBoost(terms, cand) {
  if (terms.length === 0) return 0;
  const heading = (cand.doc.metadata?.heading || "").toLowerCase();
  const body = (cand.doc.pageContent || "").toLowerCase();

  let headingHits = 0;
  let bodyHits = 0;
  for (const t of terms) {
    if (heading.includes(t)) headingHits += 1;
    else if (body.includes(t)) bodyHits += 1;
  }

  const headingRatio = headingHits / terms.length;
  const bodyRatio = bodyHits / terms.length;
  return 0.12 * headingRatio + 0.04 * bodyRatio;
}

/**
 * Maximal Marginal Relevance selection for result diversity.
 */
export function mmrSelect(queryVector, candidates, k, lambda) {
  const selected = [];
  const remaining = [...candidates];

  for (const c of remaining) {
    c._rel = cosineSimilarity(queryVector, c.vector) + (c._lexBoost || 0);
  }

  while (selected.length < k && remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const cand = remaining[i];
      let maxSimToSelected = 0;
      for (const sel of selected) {
        const sim = cosineSimilarity(cand.vector, sel.vector);
        if (sim > maxSimToSelected) maxSimToSelected = sim;
      }
      const mmrScore = lambda * cand._rel - (1 - lambda) * maxSimToSelected;
      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIdx = i;
      }
    }

    selected.push(remaining.splice(bestIdx, 1)[0]);
  }

  return selected;
}

/**
 * Full re-ranking pipeline applied to scored candidates:
 *   score filter → lexical boost → dedup → per-source cap → (MMR | top-k)
 *
 * @param {number[]} queryVector
 * @param {Array} scored - [{ doc, score, vector }]
 * @param {string} [queryText]
 * @param {object} [options]
 * @param {number} [options.minScore] - Override the similarity threshold. When
 *   the caller has already scoped retrieval to specific documents, pass a low
 *   value so vague queries (e.g. "summarize this") still return chunks.
 * @param {boolean} [options.allowFallback] - When true, if the threshold
 *   rejects everything, keep the best few candidates instead of returning
 *   nothing. Enabled for document-scoped chats.
 */
export function rerankCandidates(
  queryVector,
  scored,
  queryText = "",
  options = {},
) {
  const minScore =
    options.minScore != null
      ? options.minScore
      : RAG_CONSTANTS.MIN_SIMILARITY_SCORE;

  let candidates = scored.filter((c) => c.score >= minScore);

  // Fallback (scoped chats only): if the threshold rejected everything but we
  // do have candidates, keep the best few rather than returning nothing. The
  // user already narrowed retrieval to specific documents, so vague questions
  // like "summarize this" should still be answerable.
  if (options.allowFallback && candidates.length === 0 && scored.length > 0) {
    candidates = [...scored]
      .sort((a, b) => b.score - a.score)
      .slice(0, RAG_CONSTANTS.DEFAULT_K);
  }
  if (candidates.length === 0) return [];

  const terms = queryTerms(queryText);
  for (const c of candidates) {
    c._lexBoost = lexicalBoost(terms, c);
    c.score = c.score + c._lexBoost;
  }

  candidates.sort((a, b) => b.score - a.score);
  candidates = deduplicate(candidates);
  candidates.sort((a, b) => b.score - a.score);
  candidates = capPerSource(candidates, RAG_CONSTANTS.MAX_PER_SOURCE);

  const finalK = Math.min(RAG_CONSTANTS.DEFAULT_K, RAG_CONSTANTS.MAX_K);
  if (RAG_CONSTANTS.USE_MMR && candidates.every((c) => c.vector)) {
    return mmrSelect(queryVector, candidates, finalK, RAG_CONSTANTS.MMR_LAMBDA);
  }
  return candidates.slice(0, finalK);
}
