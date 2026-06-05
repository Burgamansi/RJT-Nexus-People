import React from "react";
import { ImportType } from "../../features/import-center/types";
import {
  Users,
  Layers,
  Activity,
  Briefcase,
  Award,
  FileCheck,
  BookOpen,
  FileText,
  Clock
} from "lucide-react";

interface ImportTypeSelectorProps {
  selectedType: ImportType;
  onChange: (type: ImportType) => void;
}

interface ImportTypeOption {
  value: ImportType;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

export const ImportTypeSelector: React.FC<ImportTypeSelectorProps> = ({
  selectedType,
  onChange
}) => {
  const options: ImportTypeOption[] = [
    {
      value: "employee",
      label: "Employees",
      desc: "Workforce staff, emails, maturity levels, and initial qualification lists.",
      icon: <Users className="w-4 h-4" />
    },
    {
      value: "organization_unit",
      label: "Organization Units",
      desc: "Sectors, departments, divisions, and operational cost centers.",
      icon: <Layers className="w-4 h-4" />
    },
    {
      value: "function",
      label: "Functions",
      desc: "Critical roles, technical descriptions, and required backup allocations.",
      icon: <Activity className="w-4 h-4" />
    },
    {
      value: "employee_assignment",
      label: "Employee Assignments",
      desc: "Primary and temporary staff assignments mapping people to positions.",
      icon: <Briefcase className="w-4 h-4" />
    },
    {
      value: "training_program",
      label: "Training Programs",
      desc: "Theoretical qualification courses linked to specific skill requirements.",
      icon: <Award className="w-4 h-4" />
    },
    {
      value: "ojt_plan",
      label: "OJT Plans",
      desc: "Practical On-the-Job training checklists mapped by employee and skill.",
      icon: <FileCheck className="w-4 h-4" />
    },
    {
      value: "knowledge_asset",
      label: "Knowledge Assets",
      desc: "Standard operating procedures, manuals, and documents inside Knowledge Hub.",
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      value: "evidence_record",
      label: "Evidence Records",
      desc: "Regulatory evidence files, ISO audits, and certification credentials.",
      icon: <FileText className="w-4 h-4" />
    },
    {
      value: "action_plan",
      label: "Action Plans",
      desc: "Structured PDCA corrective and preventive tasks linked to gaps.",
      icon: <Clock className="w-4 h-4" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {options.map((opt) => {
        const isSelected = selectedType === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            type="button"
            className={`flex items-start gap-4 p-4 rounded-xl text-left border transition-all ${
              isSelected
                ? "bg-[#00E7F8]/10 text-white border-[#00E7F8] shadow-lg shadow-[#00E7F8]/10"
                : "bg-slate-900/40 text-slate-400 border-slate-800/80 hover:border-slate-700/60 hover:text-white"
            }`}
          >
            <div
              className={`p-2.5 rounded-lg shrink-0 ${
                isSelected
                  ? "bg-[#00E7F8]/20 text-[#00E7F8]"
                  : "bg-slate-900 text-slate-500"
              }`}
            >
              {opt.icon}
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold font-mono tracking-wide uppercase">
                {opt.label}
              </h4>
              <p className="text-[10px] text-slate-500 leading-snug">
                {opt.desc}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
