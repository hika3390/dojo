import { InvalidLearningRecordFileError } from "../errors/learning-record-errors";
import type { LearningRecordState } from "../shared/learning-record.types";
import { DateKey } from "./date-key.vo";

const APP = "dojo";
const VERSION = 1;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class LearningRecordFile {
  private constructor(
    readonly state: LearningRecordState,
    readonly exportedAt: Date,
  ) {}

  static parse(text: string): LearningRecordFile {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new InvalidLearningRecordFileError();
    }
    if (!isObject(parsed) || parsed.app !== APP || !isObject(parsed.progress)) throw new InvalidLearningRecordFileError();
    const { items, daily, bookmarks } = parsed.progress;
    if (![items, daily, bookmarks].every((part) => part === undefined || isObject(part))) throw new InvalidLearningRecordFileError();
    const exportedAt = new Date(typeof parsed.exportedAt === "string" ? parsed.exportedAt : Date.now());
    return new LearningRecordFile(
      {
        items: (items ?? {}) as LearningRecordState["items"],
        daily: (daily ?? {}) as LearningRecordState["daily"],
        bookmarks: (bookmarks ?? {}) as LearningRecordState["bookmarks"],
      },
      exportedAt,
    );
  }

  static from(state: LearningRecordState, exportedAt: Date): LearningRecordFile {
    return new LearningRecordFile(state, exportedAt);
  }

  get fileName(): string {
    return `dojo-progress-${DateKey.of(this.exportedAt).value}.json`;
  }

  toText(): string {
    return JSON.stringify({ app: APP, version: VERSION, exportedAt: this.exportedAt.toISOString(), progress: this.state });
  }
}
