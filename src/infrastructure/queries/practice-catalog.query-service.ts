import type { PracticeCatalog } from "@/usecases/dto/question-query.dto";
import type { IPracticeCatalogQueryService } from "@/usecases/queries/practice-catalog.query-service.interface";

export class PracticeCatalogHttpQueryService implements IPracticeCatalogQueryService {
  private pending: Promise<PracticeCatalog> | null = null;

  constructor(private readonly endpoint: string) {}

  load(): Promise<PracticeCatalog> {
    if (!this.pending) {
      this.pending = fetch(this.endpoint).then((res) => {
        if (!res.ok) throw new Error(`問題データを取得できませんでした（${res.status}）`);
        return res.json() as Promise<PracticeCatalog>;
      });
      this.pending.catch(() => {
        this.pending = null;
      });
    }
    return this.pending;
  }
}
