import { learningRecordStorage } from "@/infrastructure/database/learning-record-storage";
import { LearningRecordQueryService } from "@/infrastructure/queries/learning-record.query-service";
import { PracticeCatalogHttpQueryService } from "@/infrastructure/queries/practice-catalog.query-service";
import { LearningRecordRepository } from "@/infrastructure/repositories/learning-record.repository";
import { LearningRecordController } from "@/presentation/controllers/learning-record.controller";
import { PracticeSessionController } from "@/presentation/controllers/practice-session.controller";
import { CountPracticeItemsUseCase } from "@/usecases/count-practice-items.use-case";
import { CreatePracticeSessionUseCase } from "@/usecases/create-practice-session.use-case";
import { ExportLearningRecordUseCase } from "@/usecases/export-learning-record.use-case";
import { ImportLearningRecordUseCase } from "@/usecases/import-learning-record.use-case";
import type { ILearningRecordQueryService } from "@/usecases/queries/learning-record.query-service.interface";
import type { IPracticeCatalogQueryService } from "@/usecases/queries/practice-catalog.query-service.interface";
import { RecordAnswerUseCase } from "@/usecases/record-answer.use-case";
import { ResetLearningRecordUseCase } from "@/usecases/reset-learning-record.use-case";
import { ToggleBookmarkUseCase } from "@/usecases/toggle-bookmark.use-case";

const learningRecordRepository = new LearningRecordRepository(learningRecordStorage);

const learningRecordQuery: ILearningRecordQueryService = new LearningRecordQueryService(learningRecordStorage);
const practiceCatalogQuery: IPracticeCatalogQueryService = new PracticeCatalogHttpQueryService("/api/kakomon");

export const browserContainer = {
  learningRecordQuery,
  practiceCatalogQuery,
  learningRecordController: new LearningRecordController({
    recordAnswer: new RecordAnswerUseCase(learningRecordRepository),
    toggleBookmark: new ToggleBookmarkUseCase(learningRecordRepository),
    reset: new ResetLearningRecordUseCase(learningRecordRepository),
    importRecord: new ImportLearningRecordUseCase(learningRecordRepository),
    exportRecord: new ExportLearningRecordUseCase(learningRecordRepository),
  }),
  practiceSessionController: new PracticeSessionController(
    new CreatePracticeSessionUseCase(learningRecordRepository),
    new CountPracticeItemsUseCase(learningRecordRepository),
  ),
};
