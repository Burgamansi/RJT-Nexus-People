import React from "react";
import { Users, AlertTriangle, Activity, CheckSquare } from "lucide-react";
import { peopleFeatureRegistry } from "../app/registry/peopleFeatureRegistry";
import { MetricCard } from "../components/ui/MetricCard";
import { ModuleCard } from "../components/ui/ModuleCard";
import { EmptyState } from "../components/ui/EmptyState";

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  // Select first 3 or 4 key highlights to display on the dashboard
  const highlightFeatures = peopleFeatureRegistry.filter(f => 
    ["workforce-map", "critical-functions", "vulnerability-analytics", "action-plans"].includes(f.id)
  );

  return (
    <div className="space-y-10">
      {/* Hero Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#04044A]/40 p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#00E7F8]/10 rounded-full blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-2">
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#00E7F8] bg-[#00E7F8]/10 px-3 py-1 rounded-full uppercase border border-[#00E7F8]/20 select-none">
            RJT NEXUS PEOPLE Foundation
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight pt-2">
            RJT NEXUS PEOPLE
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Workforce Intelligence & Knowledge Continuity Platform
          </p>
        </div>
      </div>

      {/* Analytical Metric Placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Active Employees"
          value="24"
          icon={<Users className="w-5 h-5 text-[#00E7F8]" />}
          change="+8.3% vs last quarter"
        />
        <MetricCard
          title="Critical Functions assessed"
          value="18"
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          change="9 GUT critical classification"
        />
        <MetricCard
          title="Vulnerability index"
          value="28%"
          icon={<Activity className="w-5 h-5 text-emerald-400" />}
          change="-4.2% positive improvement"
        />
        <MetricCard
          title="Action Plans Completed"
          value="85%"
          icon={<CheckSquare className="w-5 h-5 text-[#00A4FF]" />}
          change="+12% PDCA resolution"
        />
      </div>

      {/* Featured Feature Module Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-wide border-l-[3px] border-[#00E7F8] pl-3 uppercase font-mono">
          Featured Workforce Pillars
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlightFeatures.map(feat => (
            <ModuleCard
              key={feat.id}
              title={feat.title}
              description={feat.description}
              category={feat.category}
              businessPurpose={feat.businessPurpose}
              status={feat.status}
              onClick={() => onNavigate(feat.id)}
            />
          ))}
        </div>
      </div>

      {/* Premium Empty State indicating SaaS Data pipeline connection */}
      <div className="pt-6 border-t border-slate-800/80">
        <EmptyState
          title="Live Analytical Data Connection Pending"
          message="This foundation leverages isolated SaaS selector logic. Live state data mapping, dynamic GUT assessments, and audit evidence synchronization will be connected in the next phase."
          actionLabel="View all People Intelligence Modules"
          onAction={() => onNavigate("intelligence")}
        />
      </div>
    </div>
  );
};
