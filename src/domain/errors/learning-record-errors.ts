export class InvalidLearningRecordFileError extends Error {
  constructor() {
    super("このファイルは司法書士道場の学習記録ではありません");
    this.name = "InvalidLearningRecordFileError";
  }
}
