"use client";

import Link from "next/link";
import { useLearningRecord } from "@/app/_hooks/use-learning-record";
import { SUBJECTS } from "@/domain/constants/subjects";
import { itemIdsOf } from "@/presentation/shared/catalog-index";
import { SESSION_LABEL } from "@/presentation/shared/formatters";
import type { LearningRecordView as Progress } from "@/usecases/dto/learning-record-query.dto";
import type { ExamYearView as ExamYear, QuestionMapEntry } from "@/usecases/dto/question-query.dto";
import { SubjectIcon } from "./icons";
import { Card } from "./ui";

type Status = "excluded" | "none" | "partial" | "done" | "review";

const STATUS: Record<Status, { label: string; tile: string }> = {
  none: { label: "未解答", tile: "border-line bg-card" },
  partial: { label: "解答中", tile: "border-primary/30 bg-brand-soft text-brand" },
  done: { label: "全肢正解", tile: "border-ok/40 bg-ok-soft text-ok" },
  review: { label: "要復習あり", tile: "border-ng/40 bg-ng-soft text-ng" },
  excluded: { label: "対象外", tile: "border-dashed border-line text-muted" },
};

function statusOf(entry: QuestionMapEntry, progress: Progress | null): Status {
  if (entry.size === 0) return "excluded";
  if (!progress) return "none";
  const records = itemIdsOf(entry.id, entry.size).map((id) => progress.items[id]);
  if (records.some((record) => record?.needsReview)) return "review";
  const answered = records.filter(Boolean).length;
  if (answered === 0) return "none";
  return answered === entry.size ? "done" : "partial";
}

export function QuestionMap({ years, entries }: { years: ExamYear[]; entries: QuestionMapEntry[] }) {
  const progress = useLearningRecord();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
        {(["none", "partial", "done", "review", "excluded"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={`size-3 rounded-sm border ${STATUS[s].tile}`} />
            {STATUS[s].label}
          </span>
        ))}
      </div>
      {years.map((year) => {
        const own = entries.filter((e) => e.year === year.year);
        return (
          <Card key={year.year} id={`y${year.year}`} className="scroll-mt-20 space-y-4 p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight">{year.label}</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {(["am", "pm"] as const).map((session) => (
                <div key={session} className="space-y-2">
                  <p className="text-xs text-muted">{SESSION_LABEL[session]}</p>
                  {SUBJECTS.filter((s) => s.session === session).map((subject) => (
                    <div key={subject.id} className="flex items-start gap-3">
                      <span className="flex w-28 shrink-0 items-center gap-1.5 pt-1.5 text-xs">
                        <span className="text-brand">
                          <SubjectIcon subject={subject.id} size={16} />
                        </span>
                        {subject.name}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {own
                          .filter((e) => e.session === session && e.subject === subject.id)
                          .map((e) => {
                            const status = statusOf(e, progress);
                            return (
                              <Link
                                key={e.id}
                                href={`/questions/${e.id}`}
                                title={`第${e.number}問 ${subject.name}${e.topic ? ` · ${e.topic}` : ""}（${STATUS[status].label}）`}
                                className={`flex size-8 items-center justify-center rounded-md border text-xs tabular-nums hover:border-primary ${STATUS[status].tile}`}
                              >
                                {e.number}
                              </Link>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
