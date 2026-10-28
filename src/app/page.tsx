import { Suspense } from "react";
import { SlidersIcon } from "@/app/_components/icons";
import { PracticeForm } from "@/app/_components/practice-form";
import { TodayBand } from "@/app/_components/progress-widgets";
import { Container, PageBand, SectionHeading } from "@/app/_components/ui";
import { container } from "@/infrastructure/container";

export default async function Home() {
  const [totals, years] = await Promise.all([container.questionQueryService.getStatementTotals(), container.questionQueryService.listExamYears()]);
  return (
    <>
      <h1 className="sr-only">司法書士道場</h1>
      <PageBand>
        <TodayBand total={totals.all} />
      </PageBand>
      <Container className="space-y-4 pt-8">
        <SectionHeading icon={<SlidersIcon size={20} />} title="出題設定" />
        <Suspense fallback={<div className="h-[560px]" />}>
          <PracticeForm years={years} />
        </Suspense>
      </Container>
    </>
  );
}
