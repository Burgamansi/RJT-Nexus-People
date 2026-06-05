import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  isPositive?: boolean;
  onClick?: () => void;
  actionLabel?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  change,
  isPositive = true,
  onClick,
  actionLabel = "Abrir indicador",
}) => {
  const CardTag = onClick ? "button" : "div";

  return (
    <CardTag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={onClick ? actionLabel : undefined}
      className={`relative w-full overflow-hidden rounded-lg p-5 min-h-[148px] flex flex-col justify-between bg-white border border-slate-200 shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition-all duration-200 text-left ${
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_38px_rgba(15,23,42,0.10)] focus:outline-none focus:ring-2 focus:ring-blue-200"
          : ""
      }`}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-700" />

      <div className="flex items-start justify-between gap-4">
        <p className="text-[11px] font-mono font-bold uppercase tracking-wide text-slate-500 leading-snug">
          {title}
        </p>
        <div className="p-2.5 rounded-lg shrink-0 bg-blue-50 border border-blue-100 text-blue-700">
          {icon}
        </div>
      </div>

      <div className="pt-4">
        <p className="text-[34px] md:text-[38px] font-extrabold leading-tight tracking-normal text-slate-950">
          {value}
        </p>
        {change && (
          <span
            className={`inline-flex max-w-full items-center gap-1 text-[11px] font-semibold mt-3 px-2.5 py-1 rounded-md border leading-snug whitespace-normal ${
              isPositive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </CardTag>
  );
};
