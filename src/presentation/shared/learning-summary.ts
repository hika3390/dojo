import { DateKey } from "@/domain/values/date-key.vo";
import type { LearningRecordView } from "@/usecases/dto/learning-record-query.dto";

export type LearningSummary = {
  answered: number;
  attempts: number;
  correct: number;
  review: number;
};

export function summarize(view: LearningRecordView, include: (itemId: string) => boolean = () => true): LearningSummary {
  const summary: LearningSummary = { answered: 0, attempts: 0, correct: 0, review: 0 };
  for (const [itemId, history] of Object.entries(view.items)) {
    if (!include(itemId)) continue;
    summary.answered += 1;
    summary.attempts += history.n;
    summary.correct += history.c;
    if (history.needsReview) summary.review += 1;
  }
  return summary;
}

export function dailyCount(view: LearningRecordView, date: Date): { n: number; c: number } | undefined {
  return view.daily[DateKey.of(date).value];
}

export function studyStreak(view: LearningRecordView, today: Date): number {
  let offset = dailyCount(view, today)?.n ? 0 : 1;
  let count = 0;
  while (view.daily[DateKey.daysBefore(today, offset).value]?.n) {
    count += 1;
    offset += 1;
  }
  return count;
}
