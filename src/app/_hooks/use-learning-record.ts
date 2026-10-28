import { useSyncExternalStore } from "react";
import { browserContainer } from "@/infrastructure/browser-container";
import type { LearningRecordView } from "@/usecases/dto/learning-record-query.dto";

const query = browserContainer.learningRecordQuery;
const subscribe = (listener: () => void) => query.subscribe(listener);
const getSnapshot = () => query.getSnapshot();

export function useLearningRecord(): LearningRecordView | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
