import type { LearningRecordView } from "@/usecases/dto/learning-record-query.dto";

export interface ILearningRecordQueryService {
  getSnapshot(): LearningRecordView;
  subscribe(listener: () => void): () => void;
}
