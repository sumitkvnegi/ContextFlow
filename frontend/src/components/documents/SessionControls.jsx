import { Play, Square, RefreshCw } from "lucide-react";
import * as s from "../../styles/documents.styles";

export default function SessionControls({
  documents,
  selected,
  sessionActive,
  sessionDirty,
  onStartSession,
  onEndSession,
}) {
  if (!sessionActive) {
    return (
      <button
        onClick={onStartSession}
        disabled={documents.length === 0}
        className={s.startSessionButton}
      >
        <Play className="h-4 w-4" />
        {selected.size > 0
          ? `Start RAG session (${selected.size})`
          : "Start RAG session (all)"}
      </button>
    );
  }

  return (
    <>
      {sessionDirty && (
        <button onClick={onStartSession} className={s.applySelectionButton}>
          <RefreshCw className="h-4 w-4" />
          Apply new selection
        </button>
      )}
      <button onClick={onEndSession} className={s.endSessionButton}>
        <Square className="h-4 w-4" />
        End session
      </button>
    </>
  );
}

