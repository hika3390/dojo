import { LearningRecord } from "@/domain/entities/learning-record.entity";
import type { ILearningRecordRepository } from "@/domain/repositories/learning-record.repository.interface";
import type { LearningRecordState } from "@/domain/shared/learning-record.types";
import type { LearningRecordStorage } from "@/infrastructure/database/learning-record-storage";
import { toLearningRecordEntity, toLearningRecordRow } from "./mappers/learning-record.mapper";

export class LearningRecordRepository implements ILearningRecordRepository {
  constructor(private readonly storage: LearningRecordStorage) {}

  load(): LearningRecord {
    return toLearningRecordEntity(this.storage.read());
  }

  save(record: LearningRecord): void {
    this.storage.write(toLearningRecordRow(record));
  }

  replace(state: LearningRecordState): void {
    this.save(toLearningRecordEntity(state));
  }

  clear(): void {
    this.storage.remove();
  }
}
