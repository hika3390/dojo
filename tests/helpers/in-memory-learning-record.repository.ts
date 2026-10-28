import { LearningRecord } from "@/domain/entities/learning-record.entity";
import type { ILearningRecordRepository } from "@/domain/repositories/learning-record.repository.interface";
import type { LearningRecordState } from "@/domain/shared/learning-record.types";

export class InMemoryLearningRecordRepository implements ILearningRecordRepository {
  record = LearningRecord.empty();

  load(): LearningRecord {
    return this.record;
  }

  save(record: LearningRecord): void {
    this.record = record;
  }

  replace(state: LearningRecordState): void {
    this.record = LearningRecord.restore(state);
  }

  clear(): void {
    this.record = LearningRecord.empty();
  }
}
