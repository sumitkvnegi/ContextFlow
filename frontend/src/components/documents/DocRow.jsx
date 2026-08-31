import { useState } from "react";
import {
  FileText,
  FileAudio,
  Trash2,
  CheckCircle2,
  Loader2,
  Download,
} from "lucide-react";
import { transcriptUrl } from "../../services/api";
import {
  formatBytes,
  formatDuration,
  formatRelativeTime,
} from "../../utils/format";
import * as s from "../../styles/documents.styles";

function typeIcon(type) {
  return type === "media" ? FileAudio : FileText;
}

function DocIcon({ type }) {
  const Icon = typeIcon(type);
  return (
    <div className={s.docIcon(type)}>
      <Icon className="h-4.5 w-4.5" />
    </div>
  );
}

function DocInfo({ doc }) {
  return (
    <div className="min-w-0 flex-1">
      <p className={s.docTitle} title={doc.source}>
        {doc.title || doc.source}
      </p>
      <p className={s.docMetaLine}>
        <span className="capitalize">{doc.type}</span>
        <span>•</span>
        <span>{doc.chunksCreated} chunks</span>
        <span>•</span>
        <span>{formatBytes(doc.sizeBytes)}</span>
      </p>
      <p className={s.docMetaLineMuted}>
        <span>{formatRelativeTime(doc.uploadedAt)}</span>
        <span>•</span>
        <span>processed in {formatDuration(doc.processingMs)}</span>
      </p>
    </div>
  );
}

function DocActions({ doc, selected, deleting, onDelete }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">
      <span className={s.docCheckbox(selected)}>
        {selected && <CheckCircle2 className="h-3 w-3" />}
      </span>
      <div className={s.docActionsWrap}>
        {doc.type === "media" && doc.transcriptFile && (
          <a
            href={transcriptUrl(doc.id)}
            onClick={(e) => e.stopPropagation()}
            className={s.docActionIcon}
            title="Download transcript"
          >
            <Download className="h-3.5 w-3.5" />
          </a>
        )}
        <span onClick={onDelete} className={s.docDeleteIcon} title="Delete document">
          {deleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </span>
      </div>
    </div>
  );
}

export default function DocRow({ doc, selected, onToggle, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    setDeleting(true);
    try {
      await onDelete(doc.id);
    } finally {
      setDeleting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle(doc.source);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onToggle(doc.source)}
      onKeyDown={handleKeyDown}
      className={s.docRow(selected)}
    >
      <DocIcon type={doc.type} />
      <DocInfo doc={doc} />
      <DocActions
        doc={doc}
        selected={selected}
        deleting={deleting}
        onDelete={handleDelete}
      />
    </div>
  );
}
