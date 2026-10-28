import type { ILearningRecordRepository } from "@/domain/repositories/learning-record.repository.interface";

/**
 * 学習記録をすべて削除する。
 * 入力はない。保存先にある解答履歴・日別の解答数・ブックマークをまとめて消し、空の状態に戻す。
 * 元に戻す手段はないため、確認は呼び出し側の画面で行う。戻り値はない。
 */
export class ResetLearningRecordUseCase {
  constructor(private readonly records: ILearningRecordRepository) {}

  execute(): void {
    this.records.clear();
  }
}
