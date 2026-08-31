import { useRef, useState } from "react";
import { uploadFile } from "../services/api";
import { formatBytes } from "../utils/format";

const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

function findDuplicate(documents, fileName) {
  return documents?.some(
    (d) => (d.source || "").toLowerCase() === fileName.toLowerCase(),
  );
}

function startElapsedTimer(setJob, startedAt) {
  return setInterval(() => {
    setJob((j) => (j ? { ...j, elapsed: Date.now() - startedAt } : j));
  }, 200);
}

export default function useUpload({ documents, onChanged }) {
  const fileInputRef = useRef(null);
  const [job, setJob] = useState(null); // { name, phase, progress, elapsed }
  const [error, setError] = useState(null);

  const resetInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = (file) => {
    if (file.size > MAX_SIZE) {
      return `"${file.name}" is ${formatBytes(file.size)}. Maximum is 25 MB.`;
    }
    if (findDuplicate(documents, file.name)) {
      return `"${file.name}" is already uploaded. Delete it first to re-upload.`;
    }
    return null;
  };

  const handleFiles = async (files) => {
    const file = files?.[0];
    if (!file || job) return;
    setError(null);

    const validationError = validate(file);
    if (validationError) {
      setError(validationError);
      resetInput();
      return;
    }

    const timer = startElapsedTimer(setJob, Date.now());
    setJob({ name: file.name, phase: "uploading", progress: 0, elapsed: 0 });

    try {
      await uploadFile(file, (p) => {
        setJob((j) =>
          j
            ? { ...j, progress: p, phase: p >= 100 ? "processing" : "uploading" }
            : j,
        );
      });
      await onChanged();
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          err.message ||
          "Failed to process file.",
      );
    } finally {
      clearInterval(timer);
      setJob(null);
      resetInput();
    }
  };

  return {
    fileInputRef,
    job,
    error,
    clearError: () => setError(null),
    handleFiles,
  };
}
