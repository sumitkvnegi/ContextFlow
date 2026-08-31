import { MessageSquare, Play } from "lucide-react";
import * as s from "../../styles/chat.styles";

export default function EmptyState({ sessionActive, hasDocuments, onStartSession }) {
  return (
    <div className={s.emptyStateWrap}>
      <div className={s.emptyStateIconWrap}>
        <MessageSquare className="h-8 w-8 text-white" />
      </div>
      {sessionActive ? (
        <>
          <h3 className={s.emptyStateTitle}>Chat with your documents</h3>
          <p className={s.emptyStateBody}>
            Ask anything about the selected files. Answers are grounded
            strictly in your documents and transcripts.
          </p>
        </>
      ) : (
        <>
          <h3 className={s.emptyStateTitle}>Ask the AI anything</h3>
          <p className={s.emptyStateBodyWithCta}>
            You&apos;re in <strong>generic AI mode</strong> — chat freely with
            the model.{" "}
            {hasDocuments
              ? "To ground answers in your files, select document(s) in the sidebar and start a RAG session."
              : "Upload a document in the sidebar and start a session to chat over your own content."}
          </p>
          {hasDocuments && (
            <button onClick={onStartSession} className={s.emptyStateCta}>
              <Play className="h-4 w-4" />
              Start RAG session
            </button>
          )}
        </>
      )}
    </div>
  );
}

