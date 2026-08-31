export const panel =
  "flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/3 dark:shadow-none dark:backdrop-blur-sm";

export const messagesArea = "flex-1 overflow-y-auto px-4 py-6";
export const messagesStack = "space-y-4";

export const scopeBanner =
  "flex items-center gap-2 border-b border-gray-100 bg-gray-50/70 px-4 py-2.5 text-xs text-gray-600 dark:border-white/5 dark:bg-white/2 dark:text-gray-300";
export const scopeGenericNotice =
  "flex items-center gap-1 text-gray-500 dark:text-gray-400";
export const scopeActiveNotice = "flex items-center gap-1";
export const scopeActiveNoticeWrap = "flex flex-wrap items-center gap-1";
export const scopeDot = "flex h-1.5 w-1.5 rounded-full bg-emerald-500";
export const scopeSourceChip =
  "max-w-48 truncate rounded-full bg-indigo-100 px-2 py-0.5 font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300";
export const newChatButton =
  "ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 font-medium text-gray-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-indigo-400/40 dark:hover:text-indigo-300";

export const emptyStateWrap = "py-16 text-center";
export const emptyStateIconWrap =
  "mb-5 inline-flex rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 p-4 shadow-lg shadow-indigo-500/25";
export const emptyStateTitle =
  "mb-2 text-xl font-semibold text-gray-900 dark:text-white";
export const emptyStateBody = "mx-auto max-w-md text-gray-600 dark:text-gray-400";
export const emptyStateBodyWithCta =
  "mx-auto mb-5 max-w-md text-gray-600 dark:text-gray-400";
export const emptyStateCta =
  "inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700";

export function messageRow(isUser) {
  return `flex animate-fade-in-up ${isUser ? "justify-end" : "justify-start"}`;
}

export function messageBubble(isUser) {
  const base = "max-w-2xl rounded-2xl px-4 py-3";
  const variant = isUser
    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
    : "border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-100";
  return `${base} ${variant}`;
}

export function avatar(role) {
  const base =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm";
  const variant =
    role === "assistant"
      ? "bg-linear-to-br from-indigo-500 to-purple-600"
      : "bg-linear-to-br from-blue-500 to-cyan-500";
  return `${base} ${variant}`;
}

export const messageText = "whitespace-pre-wrap text-sm leading-relaxed";
export const sourceTagsWrap = "mt-2 flex flex-wrap gap-1.5";
export const sourceTag =
  "rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-white/10 dark:text-gray-300";

export const typingBubble =
  "max-w-2xl rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5";
export const typingAvatar =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600 shadow-sm";
export const typingLabel = "text-sm text-gray-600 dark:text-gray-400";

export const errorRow = "px-4";
export const errorBox =
  "mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300";
export const errorDismiss = "text-red-600 hover:text-red-800 dark:text-red-400";

export const inputBar =
  "border-t border-gray-200 bg-white/80 px-4 py-4 backdrop-blur dark:border-white/5 dark:bg-white/2";
export const inputForm = "flex items-end gap-2";
export const textarea =
  "flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:placeholder-gray-500 dark:disabled:bg-white/5";
export const sendButton =
  "rounded-xl bg-indigo-600 p-3.5 text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-white/10";
