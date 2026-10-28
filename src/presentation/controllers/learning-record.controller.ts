import { toUserMessage } from "@/presentation/shared/error-mapping";
import type { ExportedLearningRecord } from "@/usecases/dto/learning-record-query.dto";
import type { ExportLearningRecordUseCase } from "@/usecases/export-learning-record.use-case";
import type { ImportLearningRecordUseCase } from "@/usecases/import-learning-record.use-case";
import type { RecordAnswerUseCase } from "@/usecases/record-answer.use-case";
import type { ResetLearningRecordUseCase } from "@/usecases/reset-learning-record.use-case";
import type { ToggleBookmarkUseCase } from "@/usecases/toggle-bookmark.use-case";

export type ActionResult = { ok: true } | { ok: false; message: string };

function attempt(run: () => void): ActionResult {
  try {
    run();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: toUserMessage(error) };
  }
}

export class LearningRecordController {
  constructor(
    private readonly usecases: {
      recordAnswer: RecordAnswerUseCase;
      toggleBookmark: ToggleBookmarkUseCase;
      reset: ResetLearningRecordUseCase;
      importRecord: ImportLearningRecordUseCase;
      exportRecord: ExportLearningRecordUseCase;
    },
  ) {}

  recordAnswer(itemId: string, correct: boolean): ActionResult {
    return attempt(() => this.usecases.recordAnswer.execute({ itemId, correct }));
  }

  toggleBookmark(itemId: string): ActionResult {
    return attempt(() => this.usecases.toggleBookmark.execute({ itemId }));
  }

  reset(): ActionResult {
    return attempt(() => this.usecases.reset.execute());
  }

  importFile(text: string): ActionResult {
    return attempt(() => this.usecases.importRecord.execute({ text }));
  }

  exportFile(): ExportedLearningRecord {
    return this.usecases.exportRecord.execute();
  }
}
