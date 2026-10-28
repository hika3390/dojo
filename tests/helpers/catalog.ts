import type { PracticeCatalog, QuestionView } from "@/usecases/dto/question-query.dto";

export function question(id: string, overrides: Partial<QuestionView> = {}): QuestionView {
  const [year, session, number] = id.split("-");
  return {
    id,
    year: Number(year),
    session: session as QuestionView["session"],
    number: Number(number),
    subject: Number(number) <= 3 ? "kenpo" : "minpo",
    page: 1,
    supported: true,
    answer: 1,
    statements: ["ア", "イ", "ウ", "エ", "オ"].map((label) => ({ label, text: `${label}の記述`, truth: true })),
    ...overrides,
  };
}

export const catalog: PracticeCatalog = {
  years: [
    { year: 2026, label: "令和8年度", source: { page: "", am: "", pm: "", answers: "" } },
    { year: 2025, label: "令和7年度", source: { page: "", am: "", pm: "", answers: "" } },
  ],
  questions: [question("2026-am-01"), question("2026-am-04"), question("2025-am-01")],
};
