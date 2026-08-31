import { Files } from "lucide-react";
import DocRow from "./DocRow";
import * as s from "../../styles/documents.styles";

export function DocumentListHeader({ count, selectedCount, onClearSelection }) {
  return (
    <div className={s.listHeaderWrap}>
      <div className={s.listHeaderLabel}>
        <Files className="h-3.5 w-3.5" />
        Documents ({count})
      </div>
      {selectedCount > 0 && (
        <button onClick={onClearSelection} className={s.clearSelectionButton}>
          Clear ({selectedCount})
        </button>
      )}
    </div>
  );
}

export default function DocumentList({ documents, selected, onToggle, onDelete }) {
  return (
    <div className={s.listContainer}>
      {documents.length === 0 ? (
        <div className={s.listEmptyState}>
          No documents yet. Upload one to start chatting.
        </div>
      ) : (
        documents.map((doc) => (
          <DocRow
            key={doc.id}
            doc={doc}
            selected={selected.has(doc.source)}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}

