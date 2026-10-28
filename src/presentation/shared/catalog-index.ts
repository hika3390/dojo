import { ItemId } from "@/domain/values/item-id.vo";
import { QuestionId } from "@/domain/values/question-id.vo";
import type { ExamYearView, PracticeCatalog, QuestionView, StatementView } from "@/usecases/dto/question-query.dto";

export type CatalogItem = {
  id: string;
  index: number;
  question: QuestionView;
  statement: StatementView;
};

export type CatalogIndex = {
  catalog: PracticeCatalog;
  years: ExamYearView[];
  items: CatalogItem[];
  itemById: Map<string, CatalogItem>;
};

export function buildCatalogIndex(catalog: PracticeCatalog): CatalogIndex {
  const items = catalog.questions.flatMap((question) => {
    const questionId = QuestionId.create(question.id);
    return (question.statements ?? []).map((statement, index) => ({
      id: ItemId.of(questionId, index).value,
      index,
      question,
      statement,
    }));
  });
  return { catalog, years: catalog.years, items, itemById: new Map(items.map((item) => [item.id, item])) };
}

export function itemIdsOf(questionId: string, size: number): string[] {
  const id = QuestionId.create(questionId);
  return Array.from({ length: size }, (_, index) => ItemId.of(id, index).value);
}
