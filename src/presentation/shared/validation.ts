import { ItemId } from "@/domain/values/item-id.vo";
import { QuestionId } from "@/domain/values/question-id.vo";

export function toQuestionId(value: string): string | null {
  return QuestionId.tryCreate(value)?.value ?? null;
}

export function toItemRef(value: string): { questionId: string; year: number; subject: string; index: number } | null {
  const itemId = ItemId.tryCreate(value);
  if (!itemId) return null;
  return { questionId: itemId.questionId.value, year: itemId.questionId.year, subject: itemId.questionId.subject, index: itemId.index };
}
