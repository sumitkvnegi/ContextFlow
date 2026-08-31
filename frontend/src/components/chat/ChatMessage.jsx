import { Bot, User } from "lucide-react";
import * as s from "../../styles/chat.styles";

function Avatar({ role }) {
  return (
    <div className={s.avatar(role)}>
      {role === "assistant" ? (
        <Bot className="h-5 w-5 text-white" />
      ) : (
        <User className="h-5 w-5 text-white" />
      )}
    </div>
  );
}

function SourceTags({ sources }) {
  if (!sources?.length) return null;
  return (
    <div className={s.sourceTagsWrap}>
      {[...new Set(sources.map((src) => src.source))].map((src) => (
        <span key={src} className={s.sourceTag}>
          {src}
        </span>
      ))}
    </div>
  );
}

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={s.messageRow(isUser)}>
      <div className={s.messageBubble(isUser)}>
        <div className="flex items-start gap-3">
          <Avatar role={message.role} />
          <div className="flex-1 pt-1">
            <p className={s.messageText}>{message.content}</p>
            <SourceTags sources={message.sources} />
          </div>
        </div>
      </div>
    </div>
  );
}

