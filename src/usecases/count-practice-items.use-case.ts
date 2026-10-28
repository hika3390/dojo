import type { ILearningRecordRepository } from "@/domain/repositories/learning-record.repository.interface";
import type { CountPracticeItemsInput } from "@/usecases/dto/practice.dto";
import type { PracticeItemCount } from "@/usecases/dto/practice-query.dto";
import { selectPracticeItems } from "@/usecases/shared/select-practice-items";

/**
 * 出題条件に合う肢の数と、実際に出題される肢の数を数える。
 * 入力は出題条件と出題できる問題の一覧。学習記録を読み込み、演習の出題と同じ条件で肢を絞り込む。
 * 学習記録は変更しない。戻り値は条件に合う肢の数と、出題数の上限を当てはめた後の肢の数。
 */
export class CountPracticeItemsUseCase {
  constructor(private readonly records: ILearningRecordRepository) {}

  execute(input: CountPracticeItemsInput): PracticeItemCount {
    const available = selectPracticeItems(input.catalog, input.filter, this.records.load()).length;
    return { available, selected: input.filter.count > 0 ? Math.min(input.filter.count, available) : available };
  }
}
