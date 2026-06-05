import React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  isPositive?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  change,
  isPositive = true,
}) => {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-5 flex items-start justify-between group transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(37,99,235,0.3)";
        (e.currentTarget as HTMLDivElement).style.background = "rgba(37,99,235,0.06)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.border = "1px solid rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
      }}
    >
      {/* Subtle top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "linear-gradient(90deg, #2563EB, #06B6D4)" }}
      />

      <div className="flex-1 min-w-0">
        <p
          className="text-[10px] font-mono font-semibold uppercase tracking-widest truncate"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          {title}
        </p>
        <p
          className="text-[26px] font-extrabold leading-tight mt-1.5 tracking-tight text-white"
        >
          {value}
        </p>
        {change && (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-semibold mt-2 px-2 py-0.5 rounded-md"
            style={
              isPositive
                ? { background: "rgba(16,185,129,0.1)", color: "#34D399", border: "1px solid rgba(16,185,129,0.2)" }
                : { background: "rgba(239,68,68,0.1)",  color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }
            }
          >
            {change}
          </span>
        )}
      </div>

      <div
        className="ml-4 p-2.5 rounded-xl shrink-0 transition-all group-hover:scale-110"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {icon}
      </div>
    </div>
  );
};
