import type { Metadata } from "next";
import { QuestionMap } from "@/app/_components/question-map";
import { Container } from "@/app/_components/ui";
import { container } from "@/infrastructure/container";

export const metadata: Metadata = { title: "過去問一覧" };

export default async function QuestionsPage() {
  const [entries, years] = await Promise.all([container.questionQueryService.getQuestionMap(), container.questionQueryService.listExamYears()]);
  return (
    <Container className="pt-8">
      <h1 className="sr-only">過去問一覧</h1>
      <QuestionMap years={years} entries={entries} />
    </Container>
  );
}
