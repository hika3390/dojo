import type { PracticeCatalog } from "@/usecases/dto/question-query.dto";

export interface IPracticeCatalogQueryService {
  load(): Promise<PracticeCatalog>;
}
