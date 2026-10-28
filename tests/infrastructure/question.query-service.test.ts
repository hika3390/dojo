import { describe, expect, it } from "vitest";
import { subjectAt } from "@/domain/constants/subjects";
import { QuestionQueryService } from "@/infrastructure/queries/question.query-service";

describe("QuestionQueryService（収録データ）", () => {
  const service = new QuestionQueryService();

  it("年度ごとに午前・午後35問ずつあり、科目は問題番号の範囲と一致する", async () => {
    const [years, map] = await Promise.all([service.listExamYears(), service.getQuestionMap()]);
    for (const { year } of years) {
      expect(map.filter((q) => q.year === year && q.session === "am")).toHaveLength(35);
      expect(map.filter((q) => q.year === year && q.session === "pm")).toHaveLength(35);
    }
    for (const entry of map) expect(entry.subject).toBe(subjectAt(entry.session, entry.number));
  });

  it("演習用の一覧は○×にできる問題だけで、全肢に正誤がある", async () => {
    const catalog = await service.getPracticeCatalog();
    expect(catalog.questions.every((q) => q.supported && q.statements?.length === 5)).toBe(true);
    expect(catalog.questions.flatMap((q) => q.statements!).every((s) => typeof s.truth === "boolean")).toBe(true);
  });

  it("肢数の合計は科目別・年度別の合計と一致する", async () => {
    const totals = await service.getStatementTotals();
    const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
    expect(sum(Object.values(totals.bySubject))).toBe(totals.all);
    expect(sum(Object.values(totals.byYear))).toBe(totals.all);
  });

  it("問題詳細は前後の問題・原本PDFのページ・肢IDを返し、ない問題は null", async () => {
    const detail = await service.getQuestionDetail("2026-am-04");
    expect(detail?.pdfUrl).toMatch(/\.pdf#page=\d+$/);
    expect(detail?.previous?.id).toBe("2026-am-03");
    expect(detail?.next?.id).toBe("2026-am-05");
    expect(detail?.itemIds).toEqual(["2026-am-04-1", "2026-am-04-2", "2026-am-04-3", "2026-am-04-4", "2026-am-04-5"]);
    expect(await service.getQuestionDetail("1999-am-01")).toBeNull();
  });
});
