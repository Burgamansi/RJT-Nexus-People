import React from "react";
import { Link2 } from "lucide-react";

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-lg border border-dashed border-slate-300 bg-white max-w-xl mx-auto shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
      <div className="p-4 bg-blue-50 rounded-full border border-blue-100 text-blue-700 mb-4">
        <Link2 className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-950 tracking-tight break-words max-w-full">
        {title}
      </h3>
      <p className="text-sm text-slate-600 mt-2 max-w-sm leading-relaxed break-words">
        {message}
      </p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-6 px-4 py-2 rounded-md text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white border border-blue-700 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
