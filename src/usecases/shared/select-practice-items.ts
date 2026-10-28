import { ItemId } from "@/domain/values/item-id.vo";
import { QuestionId } from "@/domain/values/question-id.vo";
import type { PracticeFilterInput } from "@/usecases/dto/practice.dto";
import type { PracticeCatalog } from "@/usecases/dto/question-query.dto";

export type PracticeProgress = {
  isAnswered(itemId: string): boolean;
  needsReview(itemId: string): boolean;
  everMissed(itemId: string): boolean;
  isBookmarked(itemId: string): boolean;
};

type CatalogItem = { id: string; year: number; subject: string };

function catalogItems(catalog: PracticeCatalog): CatalogItem[] {
  return catalog.questions.flatMap((q) => {
    const questionId = QuestionId.create(q.id);
    return (q.statements ?? []).map((_, index) => ({ id: ItemId.of(questionId, index).value, year: q.year, subject: q.subject }));
  });
}

function matchesTarget(itemId: string, filter: PracticeFilterInput, progress: PracticeProgress): boolean {
  switch (filter.target) {
    case "unanswered":
      return !progress.isAnswered(itemId);
    case "review":
      return progress.needsReview(itemId);
    case "missed":
      return progress.everMissed(itemId);
    case "bookmark":
      return progress.isBookmarked(itemId);
    default:
      return true;
  }
}

export function selectPracticeItems(catalog: PracticeCatalog, filter: PracticeFilterInput, progress: PracticeProgress): string[] {
  const items = catalogItems(catalog);
  if (filter.ids.length) {
    const known = new Set(items.map((item) => item.id));
    return [...new Set(filter.ids)].filter((id) => known.has(id));
  }
  const years = new Set(filter.years);
  const subjects = new Set<string>(filter.subjects);
  return items
    .filter(
      (item) =>
        (years.size === 0 || years.has(item.year)) &&
        (subjects.size === 0 || subjects.has(item.subject)) &&
        matchesTarget(item.id, filter, progress),
    )
    .map((item) => item.id);
}
