import { Filter, Sparkles, SquarePen } from "lucide-react";
import * as s from "../../styles/chat.styles";

function GenericModeNotice() {
  return (
    <span className={s.scopeGenericNotice}>
      <Sparkles className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
      Generic AI mode — start a session in the sidebar to chat with your
      documents
    </span>
  );
}

function ActiveSessionNotice({ selectedSources }) {
  if (selectedSources.length === 0) {
    return (
      <span className={s.scopeActiveNotice}>
        <span className={s.scopeDot} />
        Session active · answering from all uploaded documents
      </span>
    );
  }

  return (
    <span className={s.scopeActiveNoticeWrap}>
      <span className={s.scopeDot} />
      Session active · answering from
      {selectedSources.map((src) => (
        <span key={src} className={s.scopeSourceChip} title={src}>
          {src}
        </span>
      ))}
    </span>
  );
}

export default function ScopeBanner({
  sessionActive,
  selectedSources,
  canStartNewChat,
  onNewChat,
}) {
  return (
    <div className={s.scopeBanner}>
      <Filter className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
      {sessionActive ? (
        <ActiveSessionNotice selectedSources={selectedSources} />
      ) : (
        <GenericModeNotice />
      )}

      <button
        type="button"
        onClick={onNewChat}
        disabled={!canStartNewChat}
        title="New chat — clear conversation and history"
        className={s.newChatButton}
      >
        <SquarePen className="h-3.5 w-3.5" />
        New chat
      </button>
    </div>
  );
}

