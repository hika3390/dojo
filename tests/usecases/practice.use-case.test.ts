import { beforeEach, describe, expect, it } from "vitest";
import { CountPracticeItemsUseCase } from "@/usecases/count-practice-items.use-case";
import { CreatePracticeSessionUseCase } from "@/usecases/create-practice-session.use-case";
import type { PracticeFilterInput } from "@/usecases/dto/practice.dto";
import { RecordAnswerUseCase } from "@/usecases/record-answer.use-case";
import { catalog } from "../helpers/catalog";
import { InMemoryLearningRecordRepository } from "../helpers/in-memory-learning-record.repository";

const filter = (patch: Partial<PracticeFilterInput> = {}): PracticeFilterInput => ({
  years: [],
  subjects: [],
  target: "all",
  count: 0,
  order: "sequential",
  ids: [],
  ...patch,
});

describe("出題のユースケース", () => {
  let repository: InMemoryLearningRecordRepository;

  beforeEach(() => {
    repository = new InMemoryLearningRecordRepository();
  });

  it("年度・科目で絞り込み、問題一覧の順に並べる", () => {
    const usecase = new CreatePracticeSessionUseCase(repository);
    expect(usecase.execute({ filter: filter({ years: [2026], subjects: ["minpo"] }), catalog }).itemIds).toEqual([
      "2026-am-04-1",
      "2026-am-04-2",
      "2026-am-04-3",
      "2026-am-04-4",
      "2026-am-04-5",
    ]);
  });

  it("未解答・要復習の条件は学習記録をもとに絞り込む", () => {
    const record = new RecordAnswerUseCase(repository);
    record.execute({ itemId: "2026-am-01-1", correct: false });
    record.execute({ itemId: "2026-am-01-2", correct: true });
    const usecase = new CreatePracticeSessionUseCase(repository);
    expect(usecase.execute({ filter: filter({ target: "review" }), catalog }).itemIds).toEqual(["2026-am-01-1"]);
    expect(usecase.execute({ filter: filter({ target: "unanswered" }), catalog }).itemIds).not.toContain("2026-am-01-2");
  });

  it("ランダム順では並びを混ぜてから出題数分だけ残す", () => {
    const usecase = new CreatePracticeSessionUseCase(repository, () => 0);
    const { itemIds } = usecase.execute({ filter: filter({ order: "random", count: 4 }), catalog });
    expect(itemIds).toHaveLength(4);
    expect(new Set(itemIds).size).toBe(4);
    expect(itemIds).not.toEqual(["2026-am-01-1", "2026-am-01-2", "2026-am-01-3", "2026-am-01-4"]);
  });

  it("肢IDの直接指定は、一覧にある肢だけを指定どおりの順で重複なく出す", () => {
    const usecase = new CreatePracticeSessionUseCase(repository);
    const ids = ["2025-am-01-3", "2026-am-01-1", "2025-am-01-3", "2099-am-01-1"];
    expect(usecase.execute({ filter: filter({ ids, order: "random" }), catalog }).itemIds).toEqual(["2025-am-01-3", "2026-am-01-1"]);
  });

  it("CountPracticeItemsUseCase: 条件に合う数と、出題数を当てはめた数を返す", () => {
    const usecase = new CountPracticeItemsUseCase(repository);
    expect(usecase.execute({ filter: filter({ count: 4 }), catalog })).toEqual({ available: 15, selected: 4 });
    expect(usecase.execute({ filter: filter({ target: "bookmark" }), catalog })).toEqual({ available: 0, selected: 0 });
  });
});
