import React from "react";
import { ImportType } from "../../features/import-center/types";
import { Link, HelpCircle, Check, AlertCircle } from "lucide-react";

interface ColumnMappingGridProps {
  importType: ImportType;
  headers: string[];
}

interface SchemaField {
  propName: string;
  type: string;
  required: boolean;
  desc: string;
}

export const ColumnMappingGrid: React.FC<ColumnMappingGridProps> = ({
  importType,
  headers
}) => {
  const getSchemaFields = (type: ImportType): SchemaField[] => {
    const common = [
      { propName: "id", type: "string", required: true, desc: "Unique record identifier" },
      { propName: "tenantId", type: "string", required: true, desc: "SaaS tenant boundary partition ID" }
    ];

    switch (type) {
      case "employee":
        return [
          ...common,
          { propName: "name", type: "string", required: true, desc: "Employee full name" },
          { propName: "email", type: "string", required: true, desc: "Employee email address" },
          { propName: "organizationUnitId", type: "string", required: true, desc: "Organization unit ID reference" },
          { propName: "status", type: "active | inactive", required: false, desc: "Account status" },
          { propName: "skills", type: "Array<{ skillId, proficiencyLevel, certified }>", required: false, desc: "Skill set mappings" }
        ];

      case "organization_unit":
        return [
          ...common,
          { propName: "name", type: "string", required: true, desc: "Division or sector description" },
          { propName: "type", type: "department | sector | division", required: true, desc: "Division scope class" }
        ];

      case "function":
        return [
          ...common,
          { propName: "code", type: "string", required: true, desc: "Operational unique functional code" },
          { propName: "name", type: "string", required: true, desc: "Technical position role label" },
          { propName: "description", type: "string", required: false, desc: "Summary explanation of duties" },
          { propName: "organizationUnitId", type: "string", required: true, desc: "Organization unit ID reference" },
          { propName: "isCritical", type: "boolean", required: false, desc: "Critical flag parameter" },
          { propName: "requiredBackupQuantity", type: "number", required: false, desc: "Target backup seats size" }
        ];

      case "employee_assignment":
        return [
          ...common,
          { propName: "employeeId", type: "string", required: true, desc: "Employee ID reference" },
          { propName: "organizationUnitId", type: "string", required: true, desc: "Organization unit ID reference" },
          { propName: "functionId", type: "string", required: true, desc: "Functional role ID reference" },
          { propName: "positionTitle", type: "string", required: true, desc: "Functional title description" },
          { propName: "status", type: "active | inactive | ended", required: false, desc: "Assignment status" },
          { propName: "isPrimary", type: "boolean", required: false, desc: "Primary operator allocation" },
          { propName: "startDate", type: "string (YYYY-MM-DD)", required: true, desc: "Assignment start date" }
        ];

      case "training_program":
        return [
          ...common,
          { propName: "name", type: "string", required: true, desc: "Technical instruction program title" },
          { propName: "skillId", type: "string", required: true, desc: "Target skill requirement reference" }
        ];

      case "ojt_plan":
        return [
          ...common,
          { propName: "employeeId", type: "string", required: true, desc: "Employee ID reference" },
          { propName: "skillId", type: "string", required: true, desc: "Target skill requirement reference" },
          { propName: "status", type: "planned | in_progress | completed", required: true, desc: "OJT validation status" }
        ];

      case "knowledge_asset":
        return [
          ...common,
          { propName: "code", type: "string", required: true, desc: "SOP unique document code" },
          { propName: "title", type: "string", required: true, desc: "Instruction manual title" },
          { propName: "functionId", type: "string", required: true, desc: "Linked operational function" }
        ];

      case "evidence_record":
        return [
          ...common,
          { propName: "employeeId", type: "string", required: true, desc: "Employee ID reference" },
          { propName: "functionId", type: "string", required: false, desc: "Linked operational function reference" },
          { propName: "status", type: "pending | under_review | validated | rejected", required: true, desc: "Evidence review status" },
          { propName: "evidenceUrl", type: "string", required: true, desc: "Compliance verification URL" }
        ];

      case "action_plan":
        return [
          ...common,
          { propName: "title", type: "string", required: true, desc: "Corrective action title" },
          { propName: "description", type: "string", required: true, desc: "Preventive details scope" },
          { propName: "status", type: "pending | in_progress | completed | cancelled", required: true, desc: "PDCA status workflow" },
          { propName: "priority", type: "low | medium | high | critical", required: true, desc: "Priority risk rating" },
          { propName: "sourceType", type: "string", required: true, desc: "Gap reference type" },
          { propName: "sourceRecordId", type: "string", required: true, desc: "Source record target ID" }
        ];
    }
  };

  const fields = getSchemaFields(importType);
  const normalizedHeaders = headers.map(h => h.trim().toLowerCase());

  return (
    <div className="bg-[#04044A]/40 rounded-2xl border border-slate-800 p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Link className="w-4 h-4 text-[#00E7F8]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Structural Schema Column Mappings
          </h3>
        </div>
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-slate-500 border border-slate-800">
          Source vs Destination Headers
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 font-semibold">SaaS Target Property</th>
              <th className="py-2.5 font-semibold">Target Type</th>
              <th className="py-2.5 font-semibold">Required</th>
              <th className="py-2.5 font-semibold">Description</th>
              <th className="py-2.5 font-semibold text-right">Mapping Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850">
            {fields.map((f, idx) => {
              // Check mapping status
              const hasHeader = normalizedHeaders.includes(f.propName.toLowerCase());
              
              return (
                <tr key={idx} className="hover:bg-slate-900/20 text-slate-350">
                  <td className="py-3 font-mono font-bold text-white text-[11px]">
                    {f.propName}
                  </td>
                  <td className="py-3 font-mono text-[10px] text-slate-400">
                    {f.type}
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      f.required
                        ? "bg-rose-500/10 text-rose-450 border border-rose-500/20"
                        : "bg-slate-900 text-slate-500"
                    }`}>
                      {f.required ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="py-3 text-[11px] max-w-xs truncate">
                    {f.desc}
                  </td>
                  <td className="py-3 text-right">
                    {headers.length === 0 ? (
                      <span className="flex items-center justify-end gap-1 text-[10px] text-slate-500 font-mono">
                        <HelpCircle className="w-3.5 h-3.5" />
                        No headers loaded
                      </span>
                    ) : hasHeader ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <Check className="w-3.5 h-3.5" />
                        AUTO-MAPPED
                      </span>
                    ) : f.required ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-rose-450 font-mono font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                        MISSING HEADER
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        DEFAULTED
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
