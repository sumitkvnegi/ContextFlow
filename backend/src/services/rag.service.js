import { getVectorStore } from "../config/qdrant.js";
import { embeddings } from "../config/embeddings.js";
import { llm } from "../config/llm.js";
import { RAG_CONSTANTS } from "../config/constants.js";
import {
  RAG_SYSTEM_PROMPT,
  GENERIC_SYSTEM_PROMPT,
  FALLBACK_MESSAGES,
} from "../config/prompts.js";
import { rerankCandidates } from "../utils/retrieval.util.js";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import logger from "../config/logger.js";

function formatDocuments(picked) {
  return picked
    .map((item, index) => {
      const meta = item.doc.metadata || {};
      const source = meta.source || "Unknown";
      const heading = meta.heading ? ` › ${meta.heading}` : "";
      return `Excerpt ${index + 1} — from ${source}${heading}:\n"""\n${item.doc.pageContent}\n"""`;
    })
    .join("\n\n");
}

/**
 * Clean up small-model quirks in the generated answer:
 *   - strip echoed "Excerpt N — from <file>:" scaffolding and triple-quote fences
 *   - drop the "not enough information" fallback line when the model ALSO
 *     produced a real answer alongside it (summaries often trigger this)
 */
function sanitizeAnswer(text) {
  if (!text) return text;
  let out = text
    .replace(/^\s*Excerpt\s+\d+\s+—\s+from[^\n:]*:?\s*$/gim, "")
    .replace(/^\s*"""\s*$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const fallbackRe =
    /I don't have enough information in the uploaded documents to answer this question\.?( Try uploading a relevant document first\.?)?/i;
  if (fallbackRe.test(out)) {
    const stripped = out.replace(fallbackRe, "").trim();
    // Keep the fallback only when it is essentially the entire answer.
    if (stripped.length > 40) out = stripped;
  }

  return out.trim();
}

const MAX_HISTORY_TURNS = 6;

function toChatMessages(history) {
  if (!Array.isArray(history) || history.length === 0) return [];
  return history
    .slice(-MAX_HISTORY_TURNS)
    .filter((m) => m && typeof m.content === "string" && m.content.trim())
    .map((m) =>
      m.role === "assistant"
        ? new AIMessage(m.content.trim())
        : new HumanMessage(m.content.trim()),
    );
}

function buildSourceFilter(sources) {
  if (!Array.isArray(sources) || sources.length === 0) return undefined;
  return {
    must: [
      {
        key: "metadata.source",
        match: { any: sources },
      },
    ],
  };
}

/**
 * Heuristic: does this look like a broad/summary request (e.g. "summarize this
 * document", "give me an overview", "what is this about")? For such queries the
 * user clearly wants content from their selected document(s), even though no
 * single chunk scores highly. Specific factual questions do NOT count — they
 * must still clear the normal similarity threshold so out-of-scope questions
 * return "not enough information" instead of hallucinated answers.
 */
function isBroadQuery(question) {
  const q = (question || "").toLowerCase().trim();
  if (!q) return false;
  const BROAD_PATTERNS =
    /\b(summar|overview|tl;?dr|gist|abstract|main point|key point|what('| i)s (this|it) about|what is (this|the) (doc|document|file|pdf|transcript)|tell me about (this|the) (doc|document|file|pdf|transcript)|describe (this|the) (doc|document|file))/;
  return BROAD_PATTERNS.test(q);
}

// Retrieve and re-rank the most relevant chunks for a question.
export async function retrieveContext(question, sources) {
  const vectorStore = await getVectorStore();
  const queryVector = await embeddings.embedQuery(question);

  const filter = buildSourceFilter(sources);
  const scoredDocs = await vectorStore.similaritySearchVectorWithScore(
    queryVector,
    RAG_CONSTANTS.CANDIDATE_POOL,
    filter,
  );

  if (!scoredDocs || scoredDocs.length === 0) {
    return { picked: [], contextText: "" };
  }

  const candidateTexts = scoredDocs.map(([doc]) => doc.pageContent);
  let candidateVectors = [];
  try {
    candidateVectors = await embeddings.embedDocuments(candidateTexts);
  } catch {
    candidateVectors = scoredDocs.map(() => null);
  }

  const candidates = scoredDocs.map(([doc, score], i) => ({
    doc,
    score,
    vector: candidateVectors[i],
  }));

  // A scoped chat relaxes retrieval ONLY for broad/summary questions, so vague
  // asks like "summarize this" still return content. Specific factual questions
  // must clear the normal threshold — this prevents the model from being handed
  // irrelevant chunks (and hallucinating) when the answer isn't in the docs.
  const scoped = Array.isArray(sources) && sources.length > 0;
  const broad = scoped && isBroadQuery(question);
  const picked = rerankCandidates(queryVector, candidates, question, {
    allowFallback: broad,
    ...(broad ? { minScore: 0 } : {}),
  });
  const contextText = formatDocuments(picked);

  return { picked, contextText };
}

export async function queryRAG(question, sources, history) {
  logger.info({ question, sources }, "RAG query");

  const { picked, contextText } = await retrieveContext(question, sources);

  // No chunk cleared the similarity threshold → do NOT call the LLM.
  if (picked.length === 0) {
    return {
      success: true,
      question,
      answer: FALLBACK_MESSAGES.NO_CONTEXT,
      sources: [],
    };
  }

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", RAG_SYSTEM_PROMPT],
    new MessagesPlaceholder("history"),
    ["human", "{question}"],
  ]);
  const chain = prompt.pipe(llm).pipe(new StringOutputParser());
  const answer = await chain.invoke({
    context: contextText,
    question,
    history: toChatMessages(history),
  });

  const citedSources = picked.map((item) => ({
    source: item.doc.metadata?.source || "Unknown",
    heading: item.doc.metadata?.heading || null,
    score: item.score,
  }));

  return {
    success: true,
    question,
    answer: sanitizeAnswer(answer),
    sources: citedSources,
  };
}

export async function queryGeneric(question, history) {
  logger.info({ question }, "Generic (non-RAG) query");

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", GENERIC_SYSTEM_PROMPT],
    new MessagesPlaceholder("history"),
    ["human", "{question}"],
  ]);
  const chain = prompt.pipe(llm).pipe(new StringOutputParser());
  const answer = await chain.invoke({
    question,
    history: toChatMessages(history),
  });

  return { success: true, question, answer, sources: [] };
}
