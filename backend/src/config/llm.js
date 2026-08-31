import { ChatOllama } from "@langchain/ollama";
import { LLM_CONSTANTS } from "./constants.js";

export const llm = new ChatOllama({
  model: LLM_CONSTANTS.CHAT_MODEL,
  temperature: process.env.OLLAMA_TEMPERATURE
    ? parseFloat(process.env.OLLAMA_TEMPERATURE)
    : LLM_CONSTANTS.TEMPERATURE,
  baseUrl: LLM_CONSTANTS.OLLAMA_BASE_URL,
});

export default llm;
