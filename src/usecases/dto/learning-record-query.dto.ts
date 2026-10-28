export type AnswerHistoryView = {
  n: number;
  c: number;
  last: boolean;
  at: number;
  needsReview: boolean;
  everMissed: boolean;
};

export type LearningRecordView = {
  items: Record<string, AnswerHistoryView>;
  daily: Record<string, { n: number; c: number }>;
  bookmarks: Record<string, number>;
};

export type ExportedLearningRecord = {
  fileName: string;
  content: string;
};
