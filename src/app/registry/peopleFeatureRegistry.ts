export interface PeopleFeature {
  id: string;
  title: string;
  description: string;
  route: string;
  status: "active" | "modernized" | "stable" | "beta";
  category: "Workforce Structure" | "Competence & Coverage" | "Risk & Compliance";
  businessPurpose: string;
}

export const peopleFeatureRegistry: PeopleFeature[] = [
  {
    id: "workforce-map",
    title: "Workforce Map",
    description: "Manage workforce structure, organization units, positions, and employee assignments with tenant isolated models.",
    route: "/workforce-map",
    status: "modernized",
    category: "Workforce Structure",
    businessPurpose: "Establish an accurate, SaaS-ready workforce organization foundation."
  },
  {
    id: "critical-functions",
    title: "Critical Functions",
    description: "Identify and assess operational critical functions using standard GUT criticality metrics.",
    route: "/critical-functions",
    status: "modernized",
    category: "Workforce Structure",
    businessPurpose: "Mitigate key operational continuity risks in the corporate hierarchy."
  },
  {
    id: "polyvalence-matrix",
    title: "Polyvalence Matrix",
    description: "Map primary, backup, and training qualification levels per employee and function.",
    route: "/polyvalence-matrix",
    status: "modernized",
    category: "Competence & Coverage",
    businessPurpose: "Track employee skills polyvalence and operational coverage rates."
  },
  {
    id: "backup-succession",
    title: "Backup & Succession",
    description: "Analyze backup coverage gaps, succession readiness, and operational continuity risks.",
    route: "/backup-succession",
    status: "modernized",
    category: "Competence & Coverage",
    businessPurpose: "Address critical single-point-of-failure functions with structured pipelines."
  },
  {
    id: "training-ojt",
    title: "Training & OJT",
    description: "Monitor theoretical training compliance and practical On-the-Job training validation.",
    route: "/training-ojt",
    status: "modernized",
    category: "Competence & Coverage",
    businessPurpose: "Ensure workforce operational competence matches quality and compliance guidelines."
  },
  {
    id: "knowledge-hub",
    title: "Knowledge Hub",
    description: "Track SOP documentation, revision histories, and validated operational knowledge assets.",
    route: "/knowledge-hub",
    status: "modernized",
    category: "Risk & Compliance",
    businessPurpose: "Prevent critical knowledge loss with continuous documentation reviews."
  },
  {
    id: "evidence-center",
    title: "Evidence Center",
    description: "Validate compliance proof uploads, expiration statuses, and audit readiness scores.",
    route: "/evidence-center",
    status: "modernized",
    category: "Risk & Compliance",
    businessPurpose: "Provide instant auditor-ready compliance tracing for quality controls."
  },
  {
    id: "vulnerability-analytics",
    title: "Vulnerability Analytics",
    description: "Compile live vulnerability indices and risk trends based on live operational gaps.",
    route: "/vulnerability-analytics",
    status: "modernized",
    category: "Risk & Compliance",
    businessPurpose: "Unlock proactive workforce risk dashboards with zero guesswork."
  },
  {
    id: "action-plans",
    title: "Action Plans",
    description: "Track corrective and preventive actions linked to workforce vulnerabilities and competence gaps.",
    route: "/action-plans",
    status: "modernized",
    category: "Risk & Compliance",
    businessPurpose: "Solve highlighted compliance issues using structured PDCA status workflows."
  }
];
