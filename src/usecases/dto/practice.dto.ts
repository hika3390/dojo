import type { PracticeOrder, PracticeTarget } from "@/domain/shared/practice.types";
import type { SubjectId } from "@/domain/shared/subject.types";
import type { PracticeCatalog } from "./question-query.dto";

export type PracticeFilterInput = {
  years: number[];
  subjects: SubjectId[];
  target: PracticeTarget;
  count: number;
  order: PracticeOrder;
  ids: string[];
};

export type CreatePracticeSessionInput = {
  filter: PracticeFilterInput;
  catalog: PracticeCatalog;
};

export type CountPracticeItemsInput = CreatePracticeSessionInput;
