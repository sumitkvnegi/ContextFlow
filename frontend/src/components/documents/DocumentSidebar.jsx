import { deleteDocument } from "../../services/api";
import useUpload from "../../hooks/useUpload";
import UploadDropzone from "./UploadDropzone";
import ErrorBanner from "../common/ErrorBanner";
import DocumentList, { DocumentListHeader } from "./DocumentList";
import SessionControls from "./SessionControls";
import * as s from "../../styles/documents.styles";

export default function DocumentSidebar({
  documents,
  selected,
  onToggle,
  onClearSelection,
  onChanged,
  sessionActive,
  sessionDirty,
  onStartSession,
  onEndSession,
}) {
  const { fileInputRef, job, error, clearError, handleFiles } = useUpload({
    documents,
    onChanged,
  });

  const handleDelete = async (id) => {
    await deleteDocument(id);
    await onChanged();
  };

  return (
    <aside className="flex h-full w-full flex-col gap-4">
      <UploadDropzone
        fileInputRef={fileInputRef}
        job={job}
        onFiles={handleFiles}
      />

      <ErrorBanner message={error} onDismiss={clearError} />

      <DocumentListHeader
        count={documents.length}
        selectedCount={selected.size}
        onClearSelection={onClearSelection}
      />

      <p className={s.scopeHint}>
        {selected.size > 0
          ? `Chatting over ${selected.size} selected document${selected.size > 1 ? "s" : ""}.`
          : "Chatting over all documents. Select some to narrow the scope."}
      </p>

      <DocumentList
        documents={documents}
        selected={selected}
        onToggle={onToggle}
        onDelete={handleDelete}
      />

      <div className={s.sidebarFooter}>
        <SessionControls
          documents={documents}
          selected={selected}
          sessionActive={sessionActive}
          sessionDirty={sessionDirty}
          onStartSession={onStartSession}
          onEndSession={onEndSession}
        />
      </div>
    </aside>
  );
}


