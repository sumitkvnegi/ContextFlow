import { queryRAG, queryGeneric } from "../services/rag.service.js";

export const chatController = async (req, res) => {
  const { message, sources, mode, history } = req.body;

  if (!message || message.trim() === "") {
    const error = new Error("Message is required");
    error.statusCode = 400;
    throw error;
  }

  // Normalize the short-term conversation history (defensive against bad input).
  const chatHistory = Array.isArray(history)
    ? history
        .filter(
          (m) =>
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string",
        )
        .map((m) => ({ role: m.role, content: m.content }))
    : [];

  // Generic mode: answer with the LLM directly, no retrieval.
  if (mode === "generic") {
    const generic = await queryGeneric(message.trim(), chatHistory);
    return res.json({
      success: true,
      question: message,
      answer: generic.answer,
      sources: [],
      mode: "generic",
    });
  }

  const filterSources = Array.isArray(sources)
    ? sources.filter((s) => typeof s === "string" && s.trim() !== "")
    : undefined;

  const result = await queryRAG(message.trim(), filterSources, chatHistory);

  return res.json({
    success: true,
    question: message,
    answer: result.answer,
    sources: result.sources || [],
    mode: "RAG",
  });
};
