import { Send, Loader2 } from "lucide-react";
import * as s from "../../styles/chat.styles";

export default function ChatInput({
  input,
  setInput,
  loading,
  sessionActive,
  onSubmit,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <div className={s.inputBar}>
      <form onSubmit={onSubmit} className={s.inputForm}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            sessionActive
              ? "Ask a question about your selected documents…"
              : "Ask the AI anything (generic mode)…"
          }
          disabled={loading}
          rows={1}
          className={s.textarea}
          style={{ minHeight: "52px", maxHeight: "200px" }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={s.sendButton}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
}

