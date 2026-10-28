import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronIcon, ExternalIcon, PlayIcon, SubjectIcon } from "@/app/_components/icons";
import { ItemHistory, RevealToggle } from "@/app/_components/question-islands";
import { OriginalQuestion, QuestionNote, QuestionNotes } from "@/app/_components/question-parts";
import { ButtonLink, Card, Container, PageBand, PageTitle } from "@/app/_components/ui";
import { container } from "@/infrastructure/container";
import { questionTitle, SESSION_LABEL, statementLabel, subjectName } from "@/presentation/shared/formatters";
import { practiceHref } from "@/presentation/shared/practice-filter";
import { toQuestionId } from "@/presentation/shared/validation";
import type { QuestionRef } from "@/usecases/dto/question-query.dto";

export async function generateStaticParams() {
  return (await container.questionQueryService.listQuestionIds()).map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps<"/questions/[id]">): Promise<Metadata> {
  const questionId = toQuestionId((await params).id);
  const detail = questionId ? await container.questionQueryService.getQuestionDetail(questionId) : null;
  if (!detail) return {};
  return {
    title: questionTitle(detail.question),
    description: detail.question.stem?.slice(0, 120),
  };
}

function Neighbor({ link, direction }: { link: QuestionRef | null; direction: "left" | "right" }) {
  if (!link) return <span />;
  return (
    <Link
      href={`/questions/${link.id}`}
      className={`flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3 shadow-card hover:border-primary ${
        direction === "right" ? "justify-end text-right" : ""
      }`}
    >
      {direction === "left" && <ChevronIcon direction="left" size={18} className="text-muted" />}
      <span className="min-w-0">
        <span className="block text-xs text-muted">{direction === "left" ? "前の問題" : "次の問題"}</span>
        <span className="block truncate text-sm font-medium">{questionTitle(link)}</span>
      </span>
      {direction === "right" && <ChevronIcon direction="right" size={18} className="text-muted" />}
    </Link>
  );
}

export default async function QuestionPage({ params }: PageProps<"/questions/[id]">) {
  const questionId = toQuestionId((await params).id);
  const detail = questionId ? await container.questionQueryService.getQuestionDetail(questionId) : null;
  if (!detail) notFound();
  const { question: q, exam, pdfUrl, itemIds, previous, next } = detail;
  const items = itemIds.map((id, i) => ({ id, label: statementLabel(q, q.statements![i]) }));

  return (
    <>
      <PageBand className="space-y-4">
        <nav className="flex items-center gap-1 text-xs text-muted">
          <Link href="/questions" className="hover:text-foreground">
            過去問一覧
          </Link>
          <ChevronIcon direction="right" size={12} />
          <Link href={`/questions#y${q.year}`} className="hover:text-foreground">
            {exam.label}
          </Link>
        </nav>
        <PageTitle
          icon={<SubjectIcon subject={q.subject} size={22} />}
          title={
            <>
              {exam.label} {SESSION_LABEL[q.session]} 第{q.number}問
              <span className="mt-1 block text-sm font-normal text-muted">
                {subjectName(q.subject)}
                {q.topic && ` · ${q.topic}`}
              </span>
            </>
          }
        >
          <div className="flex gap-2">
            {items.length > 0 && (
              <ButtonLink href={practiceHref({ ids: items.map((item) => item.id), count: 0 })}>
                <PlayIcon size={16} />
                1肢ずつ解く
              </ButtonLink>
            )}
            <ButtonLink href={pdfUrl} target="_blank" rel="noreferrer" variant="secondary">
              原本PDF
              <ExternalIcon size={14} />
            </ButtonLink>
          </div>
        </PageTitle>
      </PageBand>

      <Container className="max-w-4xl space-y-6 pt-8">
        <QuestionNote q={q} />

        <Card className="space-y-4 p-5 sm:p-7">
          {q.supported ? (
            <>
              <RevealToggle>
                <OriginalQuestion q={q} />
              </RevealToggle>
              <QuestionNotes q={q} />
            </>
          ) : (
            <>
              {q.stem && <p className="leading-relaxed">{q.stem}</p>}
              <p className="text-sm text-muted">○×形式の対象外（{q.issue}）</p>
            </>
          )}
        </Card>

        <ItemHistory items={items} />

        <div className="grid gap-3 sm:grid-cols-2">
          <Neighbor link={previous} direction="left" />
          <Neighbor link={next} direction="right" />
        </div>

        <p className="text-xs text-muted">
          出典：
          <a href={exam.source.page} target="_blank" rel="noreferrer" className="underline underline-offset-2">
            法務省「{exam.label}司法書士試験問題」
          </a>
          を加工して作成
        </p>
      </Container>
    </>
  );
}
