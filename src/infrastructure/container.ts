import { QuestionQueryService } from "@/infrastructure/queries/question.query-service";
import { PracticeCatalogController } from "@/presentation/controllers/practice-catalog.controller";
import type { IQuestionQueryService } from "@/usecases/queries/question.query-service.interface";

const questionQueryService: IQuestionQueryService = new QuestionQueryService();

export const container = {
  questionQueryService,
  practiceCatalogController: new PracticeCatalogController(questionQueryService),
};
