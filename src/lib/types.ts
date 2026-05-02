export type CaseStatus = "active" | "closed";
export type ImpressionStage = "INITIAL" | "FINAL";
export type ProblemStatus =
  | "active"
  | "improving"
  | "worsening"
  | "resolved"
  | "background";
export type AiReviewType =
  | "INITIAL_IMPRESSION"
  | "FINAL_IMPRESSION"
  | "PROBLEM_LIST"
  | "SOAP_ASSESSMENT";

export type Vitals = {
  bt?: string;
  bp?: string;
  pr?: string;
  rr?: string;
  spo2?: string;
};

export type LabTable = {
  schemaVersion: 1;
  columns: string[];
  rows: Array<Record<string, string>>;
};

export const defaultLabTable: LabTable = {
  schemaVersion: 1,
  columns: [
    "Test",
    "Unit",
    "Ref Range",
    "OPD",
    "Admission",
    "ERCP day",
    "Post-ERCP D1",
    "Interpretation",
  ],
  rows: [],
};

export type TimelineDraft = {
  id?: string;
  timepoint: string;
  event: string;
  interpretation: string;
  question: string;
};

export type ImpressionDraft = {
  id?: string;
  rank: number;
  title: string;
  evidence: string;
  evidenceAgainst: string;
  missingData?: string;
  dxPlan: string;
  txPlan: string;
};

export type ProblemDraft = {
  id?: string;
  priority: number;
  title: string;
  status: ProblemStatus;
  evidence: string;
  linkedImpressionRowId?: string;
  notes: string;
};

export type ProgressProblemDraft = {
  id?: string;
  problemId?: string;
  titleSnapshot: string;
  subjective: string;
  objectivePe: string;
  objectiveLab: string;
  objectiveImageProcedure: string;
  objectiveDrain: string;
  assessment: string;
  planDx: string;
  planTx: string;
  planMonitoring: string;
  planEducation: string;
};

export type AiFeedback = {
  summary: string;
  strengths: string[];
  concerns: string[];
  missingData: string[];
  revisionChecklist: string[];
  safetyPrivacyFlags: string[];
};
