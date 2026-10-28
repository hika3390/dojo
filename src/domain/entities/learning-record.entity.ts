import type { AnswerHistory, LearningRecordState } from "../shared/learning-record.types";
import { DateKey } from "../values/date-key.vo";
import type { ItemId } from "../values/item-id.vo";

export class LearningRecord {
  private constructor(private readonly state: LearningRecordState) {}

  static empty(): LearningRecord {
    return new LearningRecord({ items: {}, daily: {}, bookmarks: {} });
  }

  static restore(state: LearningRecordState): LearningRecord {
    return new LearningRecord(state);
  }

  toState(): LearningRecordState {
    return this.state;
  }

  history(itemId: string): AnswerHistory | undefined {
    return this.state.items[itemId];
  }

  isAnswered(itemId: string): boolean {
    return this.history(itemId) !== undefined;
  }

  needsReview(itemId: string): boolean {
    const history = this.history(itemId);
    return history !== undefined && !history.last;
  }

  everMissed(itemId: string): boolean {
    const history = this.history(itemId);
    return history !== undefined && history.c < history.n;
  }

  isBookmarked(itemId: string): boolean {
    return this.state.bookmarks[itemId] !== undefined;
  }

  answer(itemId: ItemId, correct: boolean, answeredAt: Date): LearningRecord {
    const key = itemId.value;
    const prev = this.history(key) ?? { n: 0, c: 0, last: correct, at: 0 };
    const day = DateKey.of(answeredAt).value;
    const daily = this.state.daily[day] ?? { n: 0, c: 0 };
    const point = correct ? 1 : 0;
    return new LearningRecord({
      ...this.state,
      items: { ...this.state.items, [key]: { n: prev.n + 1, c: prev.c + point, last: correct, at: answeredAt.getTime() } },
      daily: { ...this.state.daily, [day]: { n: daily.n + 1, c: daily.c + point } },
    });
  }

  toggleBookmark(itemId: ItemId, at: Date): LearningRecord {
    const bookmarks = { ...this.state.bookmarks };
    if (bookmarks[itemId.value] !== undefined) delete bookmarks[itemId.value];
    else bookmarks[itemId.value] = at.getTime();
    return new LearningRecord({ ...this.state, bookmarks });
  }
}
