export type WritingPromptSupport = {
  id: string;
  label: string;
  content: string;
};

export type WritingRubricCriterion = {
  id: string;
  title: string;
  description: string;
};

export type WritingPromptRecord = {
  id: string;
  domain: string;
  title?: string;
  promptText: string;
  scenario?: string;
  task?: string;
  logic?: string;
  sentenceStarter?: string;
  powerWords?: string[];
  requiredElements?: string[];
  checklistItems?: string[];
  supports?: WritingPromptSupport[];
  idealAnswer?: string;
  acceptableBarrierTerms?: string[];
  evidenceTerms?: string[];
  sdiTerms?: string[];
  keywords?: string[];
  rubric?: WritingRubricCriterion[];
};

export type WritingValidationResult = {
  isValid: boolean;
  errors: string[];
  wordCount: number;
};

export type KeywordMatchSummary = {
  matched: string[];
  missing: string[];
};

export type SubmissionScoreEstimate = {
  value: number;
  max: number;
  label: string;
};

export type WritingSubmissionFeedback = {
  responseText: string;
  wordCount: number;
  keywordSummary: KeywordMatchSummary;
  writingCheck: {
    barrier: boolean;
    evidence: boolean;
    impact: boolean;
    sdi: boolean;
    powerWordsUsed: string[];
  };
  scoreEstimate?: SubmissionScoreEstimate;
  rubricBreakdown?: Array<{
    criterion: string;
    notes: string;
  }>;
};
