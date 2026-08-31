import { Bot, Loader2 } from "lucide-react";
import * as s from "../../styles/chat.styles";

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className={s.typingBubble}>
        <div className="flex items-center gap-3">
          <div className={s.typingAvatar}>
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-1">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span className={s.typingLabel}>Thinking…</span>
          </div>
        </div>
      </div>
    </div>
  );
}

