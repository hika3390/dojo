import type { LearningRecord } from "../entities/learning-record.entity";
import type { LearningRecordState } from "../shared/learning-record.types";

export interface ILearningRecordRepository {
  load(): LearningRecord;
  save(record: LearningRecord): void;
  replace(state: LearningRecordState): void;
  clear(): void;
}
