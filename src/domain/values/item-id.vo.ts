import { InvalidItemIdError } from "../errors/question-errors";
import { QuestionId } from "./question-id.vo";

const STATEMENTS_PER_QUESTION = 5;
const PATTERN = /^(.+)-([1-9])$/;

export class ItemId {
  private constructor(
    readonly questionId: QuestionId,
    readonly index: number,
  ) {}

  static of(questionId: QuestionId, index: number): ItemId {
    if (!Number.isInteger(index) || index < 0 || index >= STATEMENTS_PER_QUESTION) {
      throw new InvalidItemIdError(`${questionId.value}-${index + 1}`);
    }
    return new ItemId(questionId, index);
  }

  static create(value: string): ItemId {
    const m = PATTERN.exec(value);
    const questionId = m ? QuestionId.tryCreate(m[1]) : null;
    if (!m || !questionId) throw new InvalidItemIdError(value);
    return ItemId.of(questionId, Number(m[2]) - 1);
  }

  static tryCreate(value: string): ItemId | null {
    try {
      return ItemId.create(value);
    } catch {
      return null;
    }
  }

  get value(): string {
    return `${this.questionId.value}-${this.index + 1}`;
  }
}
