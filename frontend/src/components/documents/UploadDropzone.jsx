import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { formatDuration } from "../../utils/format";
import * as s from "../../styles/documents.styles";

function JobProgress({ job }) {
  return (
    <div className="py-1">
      <div className={s.jobHeader}>
        <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
        {job.phase === "uploading" ? "Uploading" : "Transcribing & embedding"}
      </div>
      <p className={s.jobFileName} title={job.name}>
        {job.name}
      </p>
      <div className={s.jobTrack}>
        <div
          className={s.jobFill(job.phase)}
          style={
            job.phase === "uploading"
              ? { width: `${job.progress}%` }
              : undefined
          }
        />
      </div>
      <p className={s.jobFooter}>
        {job.phase === "uploading"
          ? `${job.progress}% uploaded`
          : "Processing…"}{" "}
        • {formatDuration(job.elapsed)} elapsed
      </p>
    </div>
  );
}

function DropzonePrompt() {
  return (
    <>
      <Upload className={s.dropzonePromptIcon} />
      <p className={s.dropzonePromptTitle}>Upload a document</p>
      <p className={s.dropzonePromptSubtitle}>
        PDF, TXT, MD, audio or video • up to 25 MB
      </p>
    </>
  );
}

export default function UploadDropzone({ fileInputRef, job, onFiles }) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onFiles(e.dataTransfer.files);
      }}
      onClick={() => !job && fileInputRef.current?.click()}
      className={s.dropzone(dragOver)}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.md,application/pdf,text/plain,audio/*,video/*"
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
        disabled={!!job}
      />
      {job ? <JobProgress job={job} /> : <DropzonePrompt />}
    </div>
  );
}

