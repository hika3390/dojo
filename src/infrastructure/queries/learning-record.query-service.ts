import type { LearningRecordStorage } from "@/infrastructure/database/learning-record-storage";
import { toLearningRecordEntity, toLearningRecordView } from "@/infrastructure/repositories/mappers/learning-record.mapper";
import type { LearningRecordView } from "@/usecases/dto/learning-record-query.dto";
import type { ILearningRecordQueryService } from "@/usecases/queries/learning-record.query-service.interface";

export class LearningRecordQueryService implements ILearningRecordQueryService {
  private snapshot: LearningRecordView | null = null;

  constructor(private readonly storage: LearningRecordStorage) {}

  getSnapshot(): LearningRecordView {
    this.snapshot ??= toLearningRecordView(toLearningRecordEntity(this.storage.read()));
    return this.snapshot;
  }

  subscribe(listener: () => void): () => void {
    return this.storage.subscribe(() => {
      this.snapshot = null;
      listener();
    });
  }
}
