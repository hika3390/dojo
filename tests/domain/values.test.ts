import { describe, expect, it } from "vitest";
import { InvalidItemIdError, InvalidQuestionIdError } from "@/domain/errors/question-errors";
import { InvalidLearningRecordFileError } from "@/domain/errors/learning-record-errors";
import { ItemId } from "@/domain/values/item-id.vo";
import { LearningRecordFile } from "@/domain/values/learning-record-file.vo";
import { QuestionId } from "@/domain/values/question-id.vo";

describe("QuestionId", () => {
  it("年度・午前午後・問題番号を読み取り、科目を求める", () => {
    const id = QuestionId.create("2026-pm-12");
    expect([id.year, id.session, id.number, id.subject]).toEqual([2026, "pm", 12, "fudosan"]);
  });

  it("形式が違う、または36問目以降なら作れない", () => {
    expect(() => QuestionId.create("2026-am-1")).toThrow(InvalidQuestionIdError);
    expect(() => QuestionId.create("2026-am-36")).toThrow(InvalidQuestionIdError);
    expect(QuestionId.tryCreate("abc")).toBeNull();
  });
});

describe("ItemId", () => {
  it("問題IDと肢の番号から作り、文字列に戻せる", () => {
    const id = ItemId.create("2026-am-04-3");
    expect([id.questionId.value, id.index, id.value]).toEqual(["2026-am-04", 2, "2026-am-04-3"]);
  });

  it("6番目以降の肢や不正な問題IDは作れない", () => {
    expect(() => ItemId.create("2026-am-04-6")).toThrow(InvalidItemIdError);
    expect(() => ItemId.create("2026-xx-04-1")).toThrow(InvalidItemIdError);
  });
});

describe("LearningRecordFile", () => {
  it("書き出した内容を読み込むと同じ記録に戻る", () => {
    const state = { items: { "2026-am-01-1": { n: 2, c: 1, last: false, at: 1 } }, daily: {}, bookmarks: {} };
    const file = LearningRecordFile.from(state, new Date(2026, 9, 28));
    expect(file.fileName).toBe("dojo-progress-2026-10-28.json");
    expect(LearningRecordFile.parse(file.toText()).state).toEqual(state);
  });

  it("アプリ名が違うファイルやJSONでないファイルは読み込めない", () => {
    expect(() => LearningRecordFile.parse('{"app":"other","progress":{}}')).toThrow(InvalidLearningRecordFileError);
    expect(() => LearningRecordFile.parse("not json")).toThrow(InvalidLearningRecordFileError);
  });
});
