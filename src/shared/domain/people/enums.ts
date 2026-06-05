export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

export enum ActionStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export enum EvidenceStatus {
  PENDING = "pending",
  UNDER_REVIEW = "under_review",
  VALIDATED = "validated",
  REJECTED = "rejected"
}

export enum ActionGapType {
  MISSING_OWNER = "missing_owner",
  MISSING_DUE_DATE = "missing_due_date",
  MISSING_EVIDENCE = "missing_evidence",
  OVERDUE_ACTION = "overdue_action",
  HIGH_PRIORITY_OPEN = "high_priority_open",
  CRITICAL_FUNCTION_WITHOUT_ACTION = "critical_function_without_action",
  VULNERABILITY_WITHOUT_ACTION = "vulnerability_without_action",
  TRAINING_NEED_WITHOUT_ACTION = "training_need_without_action",
  KNOWLEDGE_GAP_WITHOUT_ACTION = "knowledge_gap_without_action",
  EVIDENCE_GAP_WITHOUT_ACTION = "evidence_gap_without_action"
}
