import type { IQuestionQueryService } from "@/usecases/queries/question.query-service.interface";
import { toUserMessage } from "@/presentation/shared/error-mapping";

export class PracticeCatalogController {
  constructor(private readonly questions: IQuestionQueryService) {}

  async get(): Promise<Response> {
    try {
      return Response.json(await this.questions.getPracticeCatalog());
    } catch (error) {
      console.error("演習用の問題一覧を作れませんでした", error);
      return Response.json({ message: toUserMessage(error) }, { status: 500 });
    }
  }
}
