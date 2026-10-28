import type { Session } from "../shared/exam.types";
import type { Polarity, QuestionKind } from "../shared/question.types";
import type { SubjectId } from "../shared/subject.types";

export type Statement = {
  label: string;
  text: string;
  context?: string;
  truth?: boolean;
};

export type Question = {
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
  statements?: Statement[];
  choices?: string[][];
  issue?: string;
  note?: string;
  noteUrl?: string;
};

export function isPracticable(question: Question): boolean {
  return question.supported && (question.statements?.length ?? 0) > 0;
}
