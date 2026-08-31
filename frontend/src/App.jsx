import { useState, useEffect, useCallback } from "react";
import Navbar from "./components/layout/Navbar";
import DocumentSidebar from "./components/documents/DocumentSidebar";
import ChatPanel from "./components/chat/ChatPanel";
import { listDocuments } from "./services/api";
import * as s from "./styles/app.styles";

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [session, setSession] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
      syncSelectionWithDocs(docs, setSelected);
      syncSessionWithDocs(docs, setSession);
    } catch {
      // Ignore errors
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = (source) => {
    setSelected((prev) => toggleInSet(prev, source));
  };

  const wantedSources = () =>
    selected.size > 0 ? [...selected] : documents.map((d) => d.source);

  const startSession = () => {
    const sources = wantedSources();
    if (sources.length > 0) setSession(sources);
  };

  const endSession = () => setSession(null);

  const sessionDirty = isSessionDirty(session, wantedSources());

  return (
    <div className={s.appShell}>
      <div className={s.glowLayer}>
        <div className={s.glowOne} />
        <div className={s.glowTwo} />
      </div>

      <Navbar documentCount={documents.length} />

      <div className={s.mainLayout}>
        <div className={s.sidebarSlot}>
          <DocumentSidebar
            documents={documents}
            selected={selected}
            onToggle={toggle}
            onClearSelection={() => setSelected(new Set())}
            onChanged={refresh}
            sessionActive={session !== null}
            sessionDirty={sessionDirty}
            onStartSession={startSession}
            onEndSession={endSession}
          />
        </div>
        <div className={s.chatSlot}>
          <ChatPanel
            session={session}
            onStartSession={startSession}
            hasDocuments={documents.length > 0}
          />
        </div>
      </div>
    </div>
  );
}

function toggleInSet(set, value) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function syncSelectionWithDocs(docs, setSelected) {
  const valid = new Set(docs.map((d) => d.source));
  setSelected((prev) => {
    const next = new Set([...prev].filter((s) => valid.has(s)));
    return next.size === prev.size ? prev : next;
  });
}

function syncSessionWithDocs(docs, setSession) {
  const valid = new Set(docs.map((d) => d.source));
  setSession((prev) => {
    if (!prev) return prev;
    const next = prev.filter((s) => valid.has(s));
    if (next.length === 0) return null;
    return next.length === prev.length ? prev : next;
  });
}

function isSessionDirty(session, wanted) {
  if (session === null) return false;
  if (wanted.length !== session.length) return true;
  const set = new Set(session);
  return wanted.some((s) => !set.has(s));
}
