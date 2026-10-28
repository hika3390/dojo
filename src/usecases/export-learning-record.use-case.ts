import type { ILearningRecordRepository } from "@/domain/repositories/learning-record.repository.interface";
import { LearningRecordFile } from "@/domain/values/learning-record-file.vo";
import type { ExportedLearningRecord } from "@/usecases/dto/learning-record-query.dto";

/**
 * 学習記録をファイルに書き出すための中身を作る。
 * 入力はない。保存先から学習記録を読み込み、アプリ名・形式の版・書き出し日時を付けたJSON文字列にする。
 * 保存先は変更しない。戻り値は「dojo-progress-日付.json」のファイル名とJSON文字列。
 */
export class ExportLearningRecordUseCase {
  constructor(
    private readonly records: ILearningRecordRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  execute(): ExportedLearningRecord {
    const file = LearningRecordFile.from(this.records.load().toState(), this.now());
    return { fileName: file.fileName, content: file.toText() };
  }
}
