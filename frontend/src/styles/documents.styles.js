export function docIcon(type) {
  const base =
    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg";
  const variant =
    type === "media"
      ? "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300"
      : "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300";
  return `${base} ${variant}`;
}

export const docTitle =
  "truncate text-sm font-medium text-gray-900 dark:text-gray-100";
export const docMetaLine =
  "mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-500 dark:text-gray-400";
export const docMetaLineMuted =
  "mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-gray-400 dark:text-gray-500";

export function docCheckbox(selected) {
  const base = "flex h-4 w-4 items-center justify-center rounded-md border";
  const variant = selected
    ? "border-indigo-500 bg-indigo-500 text-white"
    : "border-gray-300 bg-white dark:border-white/20 dark:bg-transparent";
  return `${base} ${variant}`;
}

export const docActionsWrap =
  "flex items-center gap-1.5 opacity-0 transition group-hover:opacity-100";
export const docActionIcon =
  "cursor-pointer text-gray-300 hover:text-indigo-500 dark:text-gray-500 dark:hover:text-indigo-400";
export const docDeleteIcon =
  "cursor-pointer text-gray-300 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400";

export function docRow(selected) {
  const base =
    "group flex w-full cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition";
  const variant = selected
    ? "border-indigo-400 bg-indigo-50/70 ring-1 ring-indigo-400 dark:border-indigo-400/60 dark:bg-indigo-500/10 dark:ring-indigo-400/40"
    : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-400/40 dark:hover:bg-white/10";
  return `${base} ${variant}`;
}

export const listHeaderWrap = "flex items-center justify-between px-1";
export const listHeaderLabel =
  "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";
export const clearSelectionButton =
  "text-[11px] font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300";

export const listContainer = "flex-1 space-y-2 overflow-y-auto pr-0.5";
export const listEmptyState =
  "rounded-xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400 dark:border-white/10 dark:text-gray-500";

export function dropzone(dragOver) {
  const base =
    "cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition";
  const variant = dragOver
    ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-500/10"
    : "border-gray-300 bg-white hover:border-indigo-400 dark:border-white/15 dark:bg-white/5 dark:hover:border-indigo-400/50";
  return `${base} ${variant}`;
}

export const dropzonePromptIcon =
  "mx-auto mb-2 h-6 w-6 text-gray-400 dark:text-gray-500";
export const dropzonePromptTitle =
  "text-sm font-medium text-gray-700 dark:text-gray-200";
export const dropzonePromptSubtitle =
  "mt-0.5 text-[11px] text-gray-400 dark:text-gray-500";

export const jobHeader =
  "mb-2 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200";
export const jobFileName =
  "mb-2 truncate text-xs text-gray-500 dark:text-gray-400";
export const jobTrack =
  "h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10";

export function jobFill(phase) {
  const base = "h-full rounded-full transition-all";
  const variant =
    phase === "processing"
      ? "w-full animate-pulse bg-purple-500"
      : "bg-indigo-600";
  return `${base} ${variant}`;
}

export const jobFooter = "mt-2 text-[11px] text-gray-400 dark:text-gray-500";

export const scopeHint = "-mt-2 px-1 text-[11px] text-gray-400 dark:text-gray-500";

export const sidebarFooter =
  "shrink-0 space-y-2 border-t border-gray-100 pt-3 dark:border-white/5";

export const startSessionButton =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none dark:disabled:bg-white/10";

export const applySelectionButton =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600";

export const endSessionButton =
  "flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10";
