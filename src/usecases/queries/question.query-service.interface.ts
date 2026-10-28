import type { ExamYearView, PracticeCatalog, QuestionDetail, QuestionMapEntry, StatementTotals } from "@/usecases/dto/question-query.dto";

export interface IQuestionQueryService {
  getPracticeCatalog(): Promise<PracticeCatalog>;
  getStatementTotals(): Promise<StatementTotals>;
  getQuestionMap(): Promise<QuestionMapEntry[]>;
  getQuestionDetail(questionId: string): Promise<QuestionDetail | null>;
  listExamYears(): Promise<ExamYearView[]>;
  listQuestionIds(): Promise<string[]>;
}
