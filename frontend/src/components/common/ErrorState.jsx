import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 rounded-xl2 bg-rose-50 px-6 py-10 text-center">
      <AlertTriangle className="text-rose-500" size={28} />
      <p className="max-w-sm text-sm font-medium text-rose-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          <RotateCcw size={16} /> Try again
        </button>
      )}
    </div>
  );
}
