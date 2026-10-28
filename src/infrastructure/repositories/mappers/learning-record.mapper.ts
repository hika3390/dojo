import { LearningRecord } from "@/domain/entities/learning-record.entity";
import type { LearningRecordState } from "@/domain/shared/learning-record.types";
import type { LearningRecordView } from "@/usecases/dto/learning-record-query.dto";

export type LearningRecordRow = LearningRecordState;

function record<T>(value: unknown): Record<string, T> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, T>) : {};
}

export function toLearningRecordEntity(row: unknown): LearningRecord {
  const value = record<unknown>(row);
  return LearningRecord.restore({ items: record(value.items), daily: record(value.daily), bookmarks: record(value.bookmarks) });
}

export function toLearningRecordRow(entity: LearningRecord): LearningRecordRow {
  return entity.toState();
}

export function toLearningRecordView(entity: LearningRecord): LearningRecordView {
  const state = entity.toState();
  const items = Object.fromEntries(
    Object.entries(state.items).map(([itemId, history]) => [
      itemId,
      { ...history, needsReview: entity.needsReview(itemId), everMissed: entity.everMissed(itemId) },
    ]),
  );
  return { items, daily: state.daily, bookmarks: state.bookmarks };
}
