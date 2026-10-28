const STORAGE_KEY = "dojo:progress:v1";

export type LearningRecordStorage = {
  read(): unknown;
  write(row: unknown): void;
  remove(): void;
  subscribe(listener: () => void): () => void;
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const learningRecordStorage: LearningRecordStorage = {
  read() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  write(row) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(row));
    } catch (error) {
      console.warn("学習記録をブラウザに保存できませんでした", error);
    }
    notify();
  },
  remove() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("学習記録をブラウザから削除できませんでした", error);
    }
    notify();
  },
  subscribe(listener) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
};
