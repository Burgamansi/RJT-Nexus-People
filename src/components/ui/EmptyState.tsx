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
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-[#04044A]/10 max-w-xl mx-auto shadow-2xl">
      <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#00E7F8] mb-4 animate-pulse">
        <Link2 className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
        {message}
      </p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-6 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-[#00E7F8] border border-slate-700/50 hover:border-[#00E7F8]/40 transition-all flex items-center gap-1.5 shadow-md active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
