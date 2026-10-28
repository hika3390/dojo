import { beforeEach, describe, expect, it } from "vitest";
import { InvalidItemIdError } from "@/domain/errors/question-errors";
import { InvalidLearningRecordFileError } from "@/domain/errors/learning-record-errors";
import { ExportLearningRecordUseCase } from "@/usecases/export-learning-record.use-case";
import { ImportLearningRecordUseCase } from "@/usecases/import-learning-record.use-case";
import { RecordAnswerUseCase } from "@/usecases/record-answer.use-case";
import { ResetLearningRecordUseCase } from "@/usecases/reset-learning-record.use-case";
import { ToggleBookmarkUseCase } from "@/usecases/toggle-bookmark.use-case";
import { InMemoryLearningRecordRepository } from "../helpers/in-memory-learning-record.repository";

const now = () => new Date(2026, 9, 28, 9, 0);

describe("学習記録のユースケース", () => {
  let repository: InMemoryLearningRecordRepository;

  beforeEach(() => {
    repository = new InMemoryLearningRecordRepository();
  });

  it("RecordAnswerUseCase: 解答回数・正解回数・直近の正誤と当日の解答数を記録する", () => {
    const usecase = new RecordAnswerUseCase(repository, now);
    usecase.execute({ itemId: "2026-am-01-1", correct: true });
    usecase.execute({ itemId: "2026-am-01-1", correct: false });
    const record = repository.load();
    expect(record.history("2026-am-01-1")).toMatchObject({ n: 2, c: 1, last: false });
    expect(record.needsReview("2026-am-01-1")).toBe(true);
    expect(record.everMissed("2026-am-01-1")).toBe(true);
    expect(record.toState().daily["2026-10-28"]).toEqual({ n: 2, c: 1 });
  });

  it("RecordAnswerUseCase: 不正な肢IDでは記録を変えずにエラーにする", () => {
    expect(() => new RecordAnswerUseCase(repository, now).execute({ itemId: "bad", correct: true })).toThrow(InvalidItemIdError);
    expect(repository.load().toState().items).toEqual({});
  });

  it("ToggleBookmarkUseCase: 付けて、もう一度で外す", () => {
    const usecase = new ToggleBookmarkUseCase(repository, now);
    usecase.execute({ itemId: "2026-am-01-2" });
    expect(repository.load().isBookmarked("2026-am-01-2")).toBe(true);
    usecase.execute({ itemId: "2026-am-01-2" });
    expect(repository.load().isBookmarked("2026-am-01-2")).toBe(false);
  });

  it("書き出し→リセット→読み込みで元の記録に戻る", () => {
    new RecordAnswerUseCase(repository, now).execute({ itemId: "2026-am-01-1", correct: true });
    const exported = new ExportLearningRecordUseCase(repository, now).execute();
    new ResetLearningRecordUseCase(repository).execute();
    expect(repository.load().isAnswered("2026-am-01-1")).toBe(false);
    new ImportLearningRecordUseCase(repository).execute({ text: exported.content });
    expect(repository.load().isAnswered("2026-am-01-1")).toBe(true);
  });

  it("ImportLearningRecordUseCase: 形の違うファイルでは今の記録を残したままエラーにする", () => {
    new RecordAnswerUseCase(repository, now).execute({ itemId: "2026-am-01-1", correct: true });
    expect(() => new ImportLearningRecordUseCase(repository).execute({ text: "{}" })).toThrow(InvalidLearningRecordFileError);
    expect(repository.load().isAnswered("2026-am-01-1")).toBe(true);
  });
});
