import { QUESTIONS_PER_SESSION, subjectAt } from "../constants/subjects";
import { InvalidQuestionIdError } from "../errors/question-errors";
import type { Session } from "../shared/exam.types";
import type { SubjectId } from "../shared/subject.types";

const PATTERN = /^(\d{4})-(am|pm)-(\d{2})$/;

export class QuestionId {
  private constructor(
    readonly year: number,
    readonly session: Session,
    readonly number: number,
  ) {}

  static create(value: string): QuestionId {
    const m = PATTERN.exec(value);
    const number = m ? Number(m[3]) : 0;
    if (!m || number < 1 || number > QUESTIONS_PER_SESSION) throw new InvalidQuestionIdError(value);
    return new QuestionId(Number(m[1]), m[2] as Session, number);
  }

  static tryCreate(value: string): QuestionId | null {
    try {
      return QuestionId.create(value);
    } catch {
      return null;
    }
  }

  get value(): string {
    return `${this.year}-${this.session}-${String(this.number).padStart(2, "0")}`;
  }

  get subject(): SubjectId {
    return subjectAt(this.session, this.number);
  }
}
