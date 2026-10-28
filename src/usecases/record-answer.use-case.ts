import type { ILearningRecordRepository } from "@/domain/repositories/learning-record.repository.interface";
import { ItemId } from "@/domain/values/item-id.vo";
import type { RecordAnswerInput } from "@/usecases/dto/learning-record.dto";

/**
 * 1肢を解いた結果を学習記録に残す。
 * 入力の肢IDを形式チェックし、不正なら InvalidItemIdError を投げて記録は変えない。
 * 学習記録を読み込み、その肢の解答回数・正解回数・直近の正誤・解答日時と、当日の解答数・正解数を1件分増やして保存する。
 * 戻り値はない。
 */
export class RecordAnswerUseCase {
  constructor(
    private readonly records: ILearningRecordRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  execute(input: RecordAnswerInput): void {
    const itemId = ItemId.create(input.itemId);
    this.records.save(this.records.load().answer(itemId, input.correct, this.now()));
  }
}
