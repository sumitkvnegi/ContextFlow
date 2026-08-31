import { AlertCircle, X } from "lucide-react";
import * as s from "../../styles/common.styles";

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className={s.errorBanner}>
      <AlertCircle className={s.errorIcon} />
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss}>
        <X className={s.dismissIcon} />
      </button>
    </div>
  );
}

