export type AnswerHistory = {
  n: number;
  c: number;
  last: boolean;
  at: number;
};

export type DailyCount = {
  n: number;
  c: number;
};

export type LearningRecordState = {
  items: Record<string, AnswerHistory>;
  daily: Record<string, DailyCount>;
  bookmarks: Record<string, number>;
};
