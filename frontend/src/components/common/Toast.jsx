import React from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const STYLES = {
  success: {
    icon: CheckCircle2,
    classes: 'bg-lagoon-600 text-white',
  },
  error: {
    icon: XCircle,
    classes: 'bg-rose-600 text-white',
  },
  info: {
    icon: Info,
    classes: 'bg-sky-700 text-white',
  },
};

export default function Toast({ toast, onDismiss }) {
  const { icon: Icon, classes } = STYLES[toast.type] || STYLES.info;

  return (
    <div
      role="status"
      className={`flex w-80 items-start gap-3 rounded-xl px-4 py-3 shadow-soft animate-[fadeIn_0.2s_ease-out] ${classes}`}
    >
      <Icon size={20} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 opacity-80 transition hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  );
}
