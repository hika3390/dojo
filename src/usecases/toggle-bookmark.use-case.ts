import type { ILearningRecordRepository } from "@/domain/repositories/learning-record.repository.interface";
import { ItemId } from "@/domain/values/item-id.vo";
import type { ToggleBookmarkInput } from "@/usecases/dto/learning-record.dto";

/**
 * 肢のブックマークを付け外しする。
 * 入力の肢IDを形式チェックし、不正なら InvalidItemIdError を投げて記録は変えない。
 * 学習記録を読み込み、その肢にブックマークがあれば外し、なければ現在日時で付けて保存する。
 * 戻り値はない。
 */
export class ToggleBookmarkUseCase {
  constructor(
    private readonly records: ILearningRecordRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  execute(input: ToggleBookmarkInput): void {
    const itemId = ItemId.create(input.itemId);
    this.records.save(this.records.load().toggleBookmark(itemId, this.now()));
  }
}
