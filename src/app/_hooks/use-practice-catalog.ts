import { useEffect, useState } from "react";
import { browserContainer } from "@/infrastructure/browser-container";
import { buildCatalogIndex, type CatalogIndex } from "@/presentation/shared/catalog-index";
import type { PracticeCatalog } from "@/usecases/dto/question-query.dto";

const indexes = new WeakMap<PracticeCatalog, CatalogIndex>();

function indexOf(catalog: PracticeCatalog): CatalogIndex {
  let index = indexes.get(catalog);
  if (!index) {
    index = buildCatalogIndex(catalog);
    indexes.set(catalog, index);
  }
  return index;
}

type State = { data: CatalogIndex | null; error: Error | null };

export function usePracticeCatalog(): State {
  const [state, setState] = useState<State>({ data: null, error: null });
  useEffect(() => {
    let alive = true;
    browserContainer.practiceCatalogQuery.load().then(
      (catalog) => alive && setState({ data: indexOf(catalog), error: null }),
      (error: Error) => alive && setState({ data: null, error }),
    );
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
