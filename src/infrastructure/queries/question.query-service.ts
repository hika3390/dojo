import years from "@/infrastructure/data/kakomon";
import { SUBJECTS } from "@/domain/constants/subjects";
import type { ExamYear } from "@/domain/entities/exam-year.entity";
import { isPracticable, type Question } from "@/domain/entities/question.entity";
import type { SubjectId } from "@/domain/shared/subject.types";
import { ItemId } from "@/domain/values/item-id.vo";
import { QuestionId } from "@/domain/values/question-id.vo";
import type {
  ExamYearView,
  PracticeCatalog,
  QuestionDetail,
  QuestionMapEntry,
  QuestionRef,
  StatementTotals,
} from "@/usecases/dto/question-query.dto";
import type { IQuestionQueryService } from "@/usecases/queries/question.query-service.interface";

export type ExamFileRow = ExamYear & { questions: Question[] };

function toRef(q: Question | undefined): QuestionRef | null {
  return q ? { id: q.id, year: q.year, session: q.session, number: q.number } : null;
}

export class QuestionQueryService implements IQuestionQueryService {
  private readonly exams: ExamYearView[];
  private readonly questions: Question[];
  private readonly indexById: Map<string, number>;

  constructor(files: ExamFileRow[] = years as unknown as ExamFileRow[]) {
    this.exams = files.map(({ year, label, source }) => ({ year, label, source }));
    this.questions = files.flatMap((file) => file.questions);
    this.indexById = new Map(this.questions.map((q, i) => [q.id, i]));
  }

  async getPracticeCatalog(): Promise<PracticeCatalog> {
    return { years: this.exams, questions: this.questions.filter(isPracticable) };
  }

  async getStatementTotals(): Promise<StatementTotals> {
    const bySubject = Object.fromEntries(SUBJECTS.map((s) => [s.id, 0])) as Record<SubjectId, number>;
    const byYear: Record<number, number> = {};
    let all = 0;
    for (const q of this.questions.filter(isPracticable)) {
      const n = q.statements!.length;
      all += n;
      bySubject[q.subject] += n;
      byYear[q.year] = (byYear[q.year] ?? 0) + n;
    }
    return { all, bySubject, byYear };
  }

  async getQuestionMap(): Promise<QuestionMapEntry[]> {
    return this.questions.map((q) => ({
      id: q.id,
      year: q.year,
      session: q.session,
      number: q.number,
      subject: q.subject,
      topic: q.topic ?? null,
      size: isPracticable(q) ? q.statements!.length : 0,
    }));
  }

  async getQuestionDetail(questionId: string): Promise<QuestionDetail | null> {
    const index = this.indexById.get(questionId);
    const question = index === undefined ? undefined : this.questions[index];
    const exam = this.exams.find((y) => y.year === question?.year);
    if (index === undefined || !question || !exam) return null;
    const id = QuestionId.create(question.id);
    return {
      question,
      exam,
      pdfUrl: `${exam.source[question.session]}#page=${question.page}`,
      itemIds: isPracticable(question) ? question.statements!.map((_, i) => ItemId.of(id, i).value) : [],
      previous: toRef(this.questions[index - 1]),
      next: toRef(this.questions[index + 1]),
    };
  }

  async listExamYears(): Promise<ExamYearView[]> {
    return this.exams;
  }

  async listQuestionIds(): Promise<string[]> {
    return this.questions.map((q) => q.id);
  }
}
