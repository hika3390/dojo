import type { Session } from "@/domain/shared/exam.types";
import type { Polarity, QuestionKind } from "@/domain/shared/question.types";
import type { SubjectId } from "@/domain/shared/subject.types";

export type StatementView = {
  label: string;
  text: string;
  context?: string;
  truth?: boolean;
};

export type QuestionView = {
  id: string;
  year: number;
  session: Session;
  number: number;
  subject: SubjectId;
  page: number;
  supported: boolean;
  answer: number | null;
  stem?: string;
  topic?: string | null;
  kind?: QuestionKind;
  prompt?: string | null;
  polarity?: Polarity | null;
  preamble?: string;
  reference?: string;
  columns?: string[];
  figure?: string;
  figureSize?: [number, number];
  notes?: string[];
  statements?: StatementView[];
  choices?: string[][];
  issue?: string;
  note?: string;
  noteUrl?: string;
};

export type ExamYearView = {
  year: number;
  label: string;
  source: { page: string; am: string; pm: string; answers: string };
};

export type PracticeCatalog = {
  years: ExamYearView[];
  questions: QuestionView[];
};

export type StatementTotals = {
  all: number;
  bySubject: Record<SubjectId, number>;
  byYear: Record<number, number>;
};

export type QuestionMapEntry = {
  id: string;
  year: number;
  session: Session;
  number: number;
  subject: SubjectId;
  topic: string | null;
  size: number;
};

export type QuestionRef = {
  id: string;
  year: number;
  session: Session;
  number: number;
};

export type QuestionDetail = {
  question: QuestionView;
  exam: ExamYearView;
  pdfUrl: string;
  itemIds: string[];
  previous: QuestionRef | null;
  next: QuestionRef | null;
};
