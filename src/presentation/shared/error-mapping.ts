import { InvalidLearningRecordFileError } from "@/domain/errors/learning-record-errors";
import { InvalidItemIdError, InvalidQuestionIdError } from "@/domain/errors/question-errors";

export function toUserMessage(error: unknown): string {
  if (error instanceof InvalidLearningRecordFileError) return error.message;
  if (error instanceof InvalidItemIdError || error instanceof InvalidQuestionIdError) return "問題の指定が正しくありません";
  return "処理に失敗しました。時間をおいてもう一度お試しください";
}
