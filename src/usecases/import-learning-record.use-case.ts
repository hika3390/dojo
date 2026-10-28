import type { ILearningRecordRepository } from "@/domain/repositories/learning-record.repository.interface";
import { LearningRecordFile } from "@/domain/values/learning-record-file.vo";
import type { ImportLearningRecordInput } from "@/usecases/dto/learning-record.dto";

/**
 * 書き出したファイルから学習記録を読み込み、今の記録と置き換える。
 * 入力のファイル内容がJSONでない、またはアプリ名や記録の形が合わない場合は InvalidLearningRecordFileError を投げ、
 * 今の記録は変更しない。形が正しければ、解答履歴・日別の解答数・ブックマークをファイルの内容で丸ごと置き換えて保存する。
 * 戻り値はない。
 */
export class ImportLearningRecordUseCase {
  constructor(private readonly records: ILearningRecordRepository) {}

  execute(input: ImportLearningRecordInput): void {
    this.records.replace(LearningRecordFile.parse(input.text).state);
  }
}
