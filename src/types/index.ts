export interface Environment {
  context_window?: number;
  temperature?: number;
  tools_enabled?: boolean;
  system_prompt_hash?: string;
  [key: string]: any;
}

export interface Patient {
  patientId: string;
  agentName: string;
  model: string | null;
  framework: string | null;
  version: string | null;
  owner: string | null;
  tags: string[];
  environment: Environment | null;
  registeredAt: string;
  lastVisit: string | null;
  visitCount: number;
  chronicConditions: string[];
  status: 'active' | 'discharged' | 'suspended';
}

export interface Diagnosis {
  ailment_code: string;
  ailment_name: string;
  confidence: number;
  matched_patterns: string[];
  severity_adjusted: number;
  notes?: string;
}

export interface Prescription {
  treatment_code: string;
  treatment_name: string;
  prescription_payload: any;
  rationale: string;
  deferred: boolean;
  deferred_reason?: string | null;
  referral?: boolean;
  referral_reason?: string | null;
}

export interface FollowupReport {
  submitted_at: string;
  outcome: 'improved' | 'no_change' | 'worsened' | 'unknown';
  outcome_text?: string | null;
  metrics?: Record<string, any> | null;
}

export interface Visit {
  visitId: string;
  patientId: string;
  state: 'TRIAGE' | 'DIAGNOSED' | 'PRESCRIBED' | 'AWAITING_FOLLOWUP' | 'RESOLVED' | 'UNRESOLVED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
  symptomText: string;
  severity: number | null;
  diagnoses: Diagnosis[] | null;
  prescriptions: Prescription[] | null;
  followupDue: string | null;
  followupReport: FollowupReport | null;
  recurrenceFlag: boolean;
  metadata: Record<string, any> | null;
}
