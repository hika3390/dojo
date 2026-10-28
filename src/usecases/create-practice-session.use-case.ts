import type { ILearningRecordRepository } from "@/domain/repositories/learning-record.repository.interface";
import type { CreatePracticeSessionInput } from "@/usecases/dto/practice.dto";
import type { PracticeSessionPlan } from "@/usecases/dto/practice-query.dto";
import { selectPracticeItems } from "@/usecases/shared/select-practice-items";

/**
 * 演習で出題する肢の並びを決める。
 * 入力は出題条件（年度・科目・出題対象・出題数・出題順、または肢IDの直接指定）と、出題できる問題の一覧。
 * 学習記録を読み込み、未解答・要復習・誤答歴あり・ブックマークの条件に合う肢を絞り込む。
 * 肢IDの直接指定がなくランダム順の場合は並びを混ぜ、出題数が0（すべて）でなければ先頭から出題数分だけ残す。
 * 学習記録は変更しない。戻り値は出題する肢IDの配列で、条件に合う肢がなければ空配列になる。
 */
export class CreatePracticeSessionUseCase {
  constructor(
    private readonly records: ILearningRecordRepository,
    private readonly random: () => number = Math.random,
  ) {}

  execute(input: CreatePracticeSessionInput): PracticeSessionPlan {
    const { filter, catalog } = input;
    const itemIds = selectPracticeItems(catalog, filter, this.records.load());
    if (filter.order === "random" && !filter.ids.length) {
      for (let i = itemIds.length - 1; i > 0; i--) {
        const j = Math.floor(this.random() * (i + 1));
        [itemIds[i], itemIds[j]] = [itemIds[j], itemIds[i]];
      }
    }
    return { itemIds: filter.count > 0 ? itemIds.slice(0, filter.count) : itemIds };
  }
}
