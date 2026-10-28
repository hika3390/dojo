import type { CountPracticeItemsUseCase } from "@/usecases/count-practice-items.use-case";
import type { CreatePracticeSessionUseCase } from "@/usecases/create-practice-session.use-case";
import type { PracticeFilterInput } from "@/usecases/dto/practice.dto";
import type { PracticeItemCount } from "@/usecases/dto/practice-query.dto";
import type { PracticeCatalog } from "@/usecases/dto/question-query.dto";

export class PracticeSessionController {
  constructor(
    private readonly createSession: CreatePracticeSessionUseCase,
    private readonly countItems: CountPracticeItemsUseCase,
  ) {}

  plan(filter: PracticeFilterInput, catalog: PracticeCatalog): string[] {
    return this.createSession.execute({ filter, catalog }).itemIds;
  }

  count(filter: PracticeFilterInput, catalog: PracticeCatalog): PracticeItemCount {
    return this.countItems.execute({ filter, catalog });
  }
}
