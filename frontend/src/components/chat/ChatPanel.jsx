import { AlertCircle, X } from "lucide-react";
import useChat from "../../hooks/useChat";
import ScopeBanner from "./ScopeBanner";
import EmptyState from "./EmptyState";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import * as s from "../../styles/chat.styles";

export default function ChatPanel({ session, onStartSession, hasDocuments }) {
  const {
    messages,
    input,
    setInput,
    loading,
    error,
    clearError,
    messagesEndRef,
    sessionActive,
    selectedSources,
    sendUserMessage,
    newChat,
  } = useChat(session);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendUserMessage(input);
  };

  return (
    <div className={s.panel}>
      <ScopeBanner
        sessionActive={sessionActive}
        selectedSources={selectedSources}
        canStartNewChat={messages.length > 0 || !!input || !!error}
        onNewChat={newChat}
      />

      <div className={s.messagesArea}>
        <div className={s.messagesStack}>
          {messages.length === 0 ? (
            <EmptyState
              sessionActive={sessionActive}
              hasDocuments={hasDocuments}
              onStartSession={onStartSession}
            />
          ) : (
            messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))
          )}

          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {error && (
        <div className={s.errorRow}>
          <div className={s.errorBox}>
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="flex-1 text-sm">{error}</span>
            <button onClick={clearError} className={s.errorDismiss}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <ChatInput
        input={input}
        setInput={setInput}
        loading={loading}
        sessionActive={sessionActive}
        onSubmit={handleSubmit}
      />
    </div>
  );
}


