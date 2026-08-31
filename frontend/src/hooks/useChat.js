import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../services/api";

const HISTORY_LIMIT = 6;

function buildHistory(messages) {
  return messages.slice(-HISTORY_LIMIT).map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

async function requestReply(userMessage, { sessionActive, selectedSources, history }) {
  if (sessionActive) {
    return sendMessage(userMessage, {
      sources: selectedSources.length > 0 ? selectedSources : undefined,
      history,
    });
  }
  return sendMessage(userMessage, { mode: "generic", history });
}

export default function useChat(session) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const sessionActive = Array.isArray(session);
  const selectedSources = sessionActive ? session : [];

  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendUserMessage = async (rawMessage) => {
    const userMessage = rawMessage.trim();
    if (!userMessage || loading) return;

    setInput("");
    setError(null);

    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = buildHistory(messages);
      const data = await requestReply(userMessage, {
        sessionActive,
        selectedSources,
        history,
      });
      const answer = data.answer || "No response received";
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: answer,
          sources: data.sources,
          mode: data.mode,
        },
      ]);
    } catch {
      setError("Failed to send message. Please try again.");
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setMessages([]);
    setError(null);
    setInput("");
  };

  return {
    messages,
    input,
    setInput,
    loading,
    error,
    clearError: () => setError(null),
    messagesEndRef,
    sessionActive,
    selectedSources,
    sendUserMessage,
    newChat,
  };
}
