import Image from "next/image";
import { SubjectIcon } from "./icons";
import { IconBox } from "./ui";
import { SESSION_LABEL, statementLabel, subjectName, yearLabel } from "@/presentation/shared/formatters";
import type { QuestionView as Question, StatementView as Statement } from "@/usecases/dto/question-query.dto";

export function QuestionMeta({ q, statement }: { q: Question; statement?: Statement }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <IconBox size="sm">
        <SubjectIcon subject={q.subject} size={18} />
      </IconBox>
      <QuestionMetaText q={q} statement={statement} />
    </div>
  );
}

export function QuestionMetaText({ q, statement }: { q: Question; statement?: Statement }) {
  return (
    <p className="text-sm text-muted">
      <span className="text-foreground">
        {yearLabel(q.year)} {SESSION_LABEL[q.session]} 第{q.number}問
        {statement && ` ${statementLabel(q, statement)}`}
      </span>
      <span className="mx-1.5">·</span>
      {subjectName(q.subject)}
      {q.topic && (
        <>
          <span className="mx-1.5">·</span>
          {q.topic}
        </>
      )}
    </p>
  );
}

export function TruthIcon({ truth, className = "size-5" }: { truth: boolean; className?: string }) {
  return truth ? (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden>
      <circle cx="12" cy="12" r="7.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  );
}

export function TruthMark({ truth, className = "" }: { truth: boolean | undefined; className?: string }) {
  if (truth === undefined) return null;
  return (
    <span
      role="img"
      aria-label={truth ? "正解は○" : "正解は×"}
      title={truth ? "正解は○" : "正解は×"}
      className={`inline-flex size-6 shrink-0 items-center justify-center ${truth ? "text-ok" : "text-ng"} ${className}`}
    >
      <TruthIcon truth={truth} className="size-[18px]" />
    </span>
  );
}

export function QuestionNotes({ q }: { q: Question }) {
  if (!q.notes?.length) return null;
  return (
    <details className="text-xs text-muted">
      <summary className="cursor-pointer select-none hover:text-foreground">注意書き</summary>
      <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed">
        {q.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </details>
  );
}

export function QuestionContext({ q }: { q: Question }) {
  return (
    <>
      {q.preamble && <p className="whitespace-pre-line leading-relaxed">{q.preamble}</p>}
      {q.figure && q.figureSize && (
        <div className="overflow-hidden rounded-lg border border-line bg-white p-2">
          <Image
            src={q.figure}
            width={q.figureSize[0]}
            height={q.figureSize[1]}
            sizes="(max-width: 768px) 100vw, 768px"
            alt="問題文中の登記記録"
            className="h-auto w-full"
          />
        </div>
      )}
      {q.reference && <div className="whitespace-pre-line rounded-lg bg-surface px-4 py-3 text-sm leading-relaxed text-muted">{q.reference}</div>}
    </>
  );
}

const CELL = /^【(.+?)】(.*)$/;

export function StatementText({ statement, size = "base" }: { statement: Statement; size?: "base" | "lg" }) {
  const cells = statement.text.split("\n").map((line) => CELL.exec(line));
  const textClass = size === "lg" ? "text-[17px] leading-8" : "leading-relaxed";
  if (cells.every(Boolean)) {
    return (
      <dl className={`grid gap-2 ${textClass}`}>
        {cells.map((m, i) => (
          <div key={i} className="grid gap-0.5 sm:grid-cols-[4rem_1fr] sm:gap-3">
            <dt className="pt-0.5 text-xs text-muted sm:pt-1.5">{m![1]}</dt>
            <dd>{m![2]}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return <p className={`whitespace-pre-line ${textClass}`}>{statement.text}</p>;
}

export function DialogueContext({ statement }: { statement: Statement }) {
  if (!statement.context) return null;
  return (
    <div className="space-y-1 rounded-lg bg-surface px-4 py-3 text-sm leading-relaxed">
      {statement.context.split("\n").map((line, i) => {
        const [speaker, ...rest] = line.split("：");
        return rest.length ? (
          <p key={i}>
            <span className="text-muted">{speaker}：</span>
            {rest.join("：")}
          </p>
        ) : (
          <p key={i}>{line}</p>
        );
      })}
    </div>
  );
}

export function AnswerLine({ q }: { q: Question }) {
  if (q.answer === null || !q.choices) {
    return q.note ? <p className="text-sm text-muted">正解：全員正解</p> : null;
  }
  const choice = q.choices[q.answer - 1];
  return (
    <p className="text-sm text-muted">
      正解：
      <span className="font-medium text-foreground">
        {q.answer}
        {q.kind === "combo" && `（${choice.join("")}）`}
      </span>
    </p>
  );
}

export function QuestionNote({ q }: { q: Question }) {
  if (!q.note) return null;
  return (
    <p className="rounded-lg bg-ng-soft px-3 py-2 text-xs leading-relaxed text-ng">
      {q.note}
      {q.noteUrl && (
        <a href={q.noteUrl} target="_blank" rel="noreferrer" className="ml-1 underline underline-offset-2">
          法務省の発表
        </a>
      )}
    </p>
  );
}

export function OriginalQuestion({
  q,
  highlight,
  showContext = true,
}: {
  q: Question;
  highlight?: number;
  showContext?: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="leading-relaxed">{q.stem}</p>
      {showContext && <QuestionContext q={q} />}
      <ol className="divide-y divide-line border-y border-line">
        {q.statements?.map((s, i) => (
          <li key={s.label} className={`flex gap-3 px-2 py-3 ${i === highlight ? "bg-surface" : ""}`}>
            <span className="w-6 shrink-0 font-medium">{s.label}</span>
            <div className="min-w-0 flex-1 space-y-2">
              <DialogueContext statement={s} />
              <StatementText statement={s} />
            </div>
            <TruthMark truth={s.truth} className="group-data-[reveal=false]/reveal:invisible" />
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        {q.kind === "combo" && q.choices && (
          <p className="text-sm text-muted">
            {q.choices.map((c, i) => (
              <span key={i} className="mr-4 whitespace-nowrap">
                {i + 1}　{c.join("")}
              </span>
            ))}
          </p>
        )}
        <div className="group-data-[reveal=false]/reveal:invisible">
          <AnswerLine q={q} />
        </div>
      </div>
    </div>
  );
}
