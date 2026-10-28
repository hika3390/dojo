import type { Metadata } from "next";
import { StatsView } from "@/app/_components/stats-view";
import { Container } from "@/app/_components/ui";
import { container } from "@/infrastructure/container";

export const metadata: Metadata = { title: "成績" };

export default async function StatsPage() {
  const [totals, years] = await Promise.all([container.questionQueryService.getStatementTotals(), container.questionQueryService.listExamYears()]);
  return (
    <Container className="pt-8">
      <h1 className="sr-only">成績</h1>
      <StatsView totals={totals} years={years} />
    </Container>
  );
}
