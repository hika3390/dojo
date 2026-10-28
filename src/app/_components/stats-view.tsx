"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useLearningRecord } from "@/app/_hooks/use-learning-record";
import { SUBJECTS } from "@/domain/constants/subjects";
import type { SubjectId } from "@/domain/shared/subject.types";
import { DateKey } from "@/domain/values/date-key.vo";
import { browserContainer } from "@/infrastructure/browser-container";
import { accuracyRate as rate } from "@/presentation/shared/formatters";
import { summarize, type LearningSummary as Summary } from "@/presentation/shared/learning-summary";
import { practiceHref } from "@/presentation/shared/practice-filter";
import { toItemRef } from "@/presentation/shared/validation";
import type { LearningRecordView as Progress } from "@/usecases/dto/learning-record-query.dto";
import type { PracticeFilterInput as PracticeFilter } from "@/usecases/dto/practice.dto";
import type { ExamYearView as ExamYear, StatementTotals } from "@/usecases/dto/question-query.dto";
import { BookIcon, CalendarIcon, CheckCircleIcon, DownloadIcon, ReviewIcon, StatsIcon, SubjectIcon, TargetIcon, TrashIcon, UploadIcon } from "./icons";
import { StatCell, StatGrid } from "./progress-widgets";
import { Button, Card, Meter, SectionHeading } from "./ui";

type Row = {
  key: string;
  label: string;
  subject?: SubjectId;
  total: number;
  summary: Summary;
  filter: Partial<PracticeFilter>;
};

function BreakdownTable({ rows, heading }: { rows: Row[]; heading: string }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[34rem] text-sm">
        <thead className="text-left text-xs text-muted">
          <tr className="border-b border-line">
            <th className="px-4 py-2.5 font-normal">{heading}</th>
            <th className="px-4 py-2.5 font-normal">解答済み</th>
            <th className="whitespace-nowrap px-4 py-2.5 text-right font-normal">正答率</th>
            <th className="whitespace-nowrap px-4 py-2.5 text-right font-normal">要復習</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => {
            const accuracy = rate(row.summary.correct, row.summary.attempts);
            return (
              <tr key={row.key}>
                <td className="whitespace-nowrap px-4 py-3 font-medium">
                  <span className="flex items-center gap-2">
                    {row.subject && (
                      <span className="text-brand">
                        <SubjectIcon subject={row.subject} size={18} />
                      </span>
                    )}
                    {row.label}
                  </span>
                </td>
                <td className="w-full px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Meter value={(row.summary.answered / row.total) * 100} label={`${row.label}の解答済みの割合`} />
                    </div>
                    <span className="w-20 shrink-0 text-right text-xs tabular-nums text-muted">
                      {row.summary.answered} / {row.total}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{accuracy === null ? "—" : `${accuracy}%`}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {row.summary.review > 0 ? (
                    <Link href={practiceHref({ ...row.filter, target: "review", count: 0 })} className="text-ng underline underline-offset-2">
                      {row.summary.review}
                    </Link>
                  ) : (
                    <span className="text-muted">0</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Link href={practiceHref(row.filter)} className="text-xs text-muted underline underline-offset-2 hover:text-foreground">
                    解く
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function ActivityChart({ progress }: { progress: Progress }) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    const record = progress.daily[DateKey.of(date).value];
    return { date, n: record?.n ?? 0, c: record?.c ?? 0 };
  });
  const top = Math.ceil(Math.max(10, ...days.map((d) => d.n)) / 10) * 10;

  return (
    <Card className="px-4 pt-5 pb-3">
      <div className="relative h-40">
        {[top, top / 2, 0].map((tick) => (
          <div key={tick} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `${(tick / top) * 100}%`, transform: "translateY(50%)" }}>
            <span className="w-6 text-right text-[10px] tabular-nums text-muted">{tick}</span>
            <div className="h-px flex-1 bg-line" />
          </div>
        ))}
        <div className="absolute inset-y-0 right-0 left-8 grid grid-cols-14">
          {days.map((d) => (
            <div key={d.date.toISOString()} className="group relative flex h-full items-end justify-center">
              <div className="w-full max-w-6 rounded-t bg-primary group-hover:opacity-80" style={{ height: `${(d.n / top) * 100}%` }} />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background group-hover:block">
                {d.date.getMonth() + 1}/{d.date.getDate()}　{d.n}肢
                {d.n > 0 && `・${rate(d.c, d.n)}%`}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 ml-8 grid grid-cols-14 text-center text-[10px] tabular-nums text-muted">
        {days.map((d, i) => (
          <span key={i}>{i % 2 === 1 ? `${d.date.getMonth() + 1}/${d.date.getDate()}` : ""}</span>
        ))}
      </div>
    </Card>
  );
}

function DataManagement() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  function download() {
    const exported = browserContainer.learningRecordController.exportFile();
    const blob = new Blob([exported.content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exported.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function upload(file: File) {
    if (!window.confirm("現在の学習記録を、選択したファイルの内容で置き換えます。よろしいですか？")) return;
    const result = browserContainer.learningRecordController.importFile(await file.text());
    setMessage(result.ok ? "読み込みました" : result.message);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={download}>
          <DownloadIcon size={16} />
          書き出す
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          <UploadIcon size={16} />
          読み込む
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            if (window.confirm("全ての学習記録を削除します。元に戻せません。よろしいですか？")) {
              const result = browserContainer.learningRecordController.reset();
              setMessage(result.ok ? "削除しました" : result.message);
            }
          }}
        >
          <TrashIcon size={16} />
          リセット
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) upload(file);
            event.target.value = "";
          }}
        />
      </div>
      {message && <p className="text-xs text-muted">{message}</p>}
    </div>
  );
}

export function StatsView({ totals, years }: { totals: StatementTotals; years: ExamYear[] }) {
  const progress = useLearningRecord();
  if (!progress) return <div className="h-96" aria-busy />;

  const overall = summarize(progress);
  const accuracy = rate(overall.correct, overall.attempts);
  const subjectRows: Row[] = SUBJECTS.map((s) => ({
    key: s.id,
    label: s.name,
    subject: s.id,
    total: totals.bySubject[s.id],
    summary: summarize(progress, (id) => toItemRef(id)?.subject === s.id),
    filter: { subjects: [s.id] },
  }));
  const yearRows: Row[] = years.map((y) => ({
    key: String(y.year),
    label: y.label,
    total: totals.byYear[y.year] ?? 0,
    summary: summarize(progress, (id) => toItemRef(id)?.year === y.year),
    filter: { years: [y.year] },
  }));

  return (
    <div className="space-y-10">
      <StatGrid>
        <StatCell
          icon={<CheckCircleIcon size={16} />}
          label="解答済み"
          value={
            <>
              {overall.answered.toLocaleString()}
              <span className="text-sm font-normal text-muted"> / {totals.all.toLocaleString()}</span>
            </>
          }
          sub={<Meter value={(overall.answered / totals.all) * 100} label="解答済みの割合" />}
        />
        <StatCell icon={<TargetIcon size={16} />} label="正答率" value={accuracy === null ? "—" : `${accuracy}%`} />
        <StatCell icon={<StatsIcon size={16} />} label="延べ解答" value={`${overall.attempts.toLocaleString()}回`} />
        <StatCell icon={<ReviewIcon size={16} />} label="要復習" value={`${overall.review}肢`} />
      </StatGrid>

      <section className="space-y-3">
        <SectionHeading icon={<CalendarIcon size={20} />} title="直近14日の解答数" />
        <ActivityChart progress={progress} />
      </section>

      <section className="space-y-3">
        <SectionHeading icon={<BookIcon size={20} />} title="科目別" />
        <BreakdownTable heading="科目" rows={subjectRows} />
      </section>

      <section className="space-y-3">
        <SectionHeading icon={<CalendarIcon size={20} />} title="年度別" />
        <BreakdownTable heading="年度" rows={yearRows} />
      </section>

      <section className="space-y-3">
        <SectionHeading icon={<DownloadIcon size={20} />} title="学習記録" />
        <DataManagement />
      </section>
    </div>
  );
}
