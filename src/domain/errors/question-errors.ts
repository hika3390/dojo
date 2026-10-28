export class InvalidQuestionIdError extends Error {
  constructor(value: string) {
    super(`問題IDの形式が正しくありません: ${value}`);
    this.name = "InvalidQuestionIdError";
  }
}

export class InvalidItemIdError extends Error {
  constructor(value: string) {
    super(`肢IDの形式が正しくありません: ${value}`);
    this.name = "InvalidItemIdError";
  }
}
