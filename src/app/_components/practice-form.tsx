"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useLearningRecord } from "@/app/_hooks/use-learning-record";
import { usePracticeCatalog } from "@/app/_hooks/use-practice-catalog";
import { SUBJECTS } from "@/domain/constants/subjects";
import type { Session } from "@/domain/shared/exam.types";
import type { SubjectId } from "@/domain/shared/subject.types";
import { browserContainer } from "@/infrastructure/browser-container";
import { SESSION_LABEL, shortYearLabel } from "@/presentation/shared/formatters";
import { COUNTS, parsePracticeFilter, practiceHref, TARGETS } from "@/presentation/shared/practice-filter";
import type { PracticeFilterInput as PracticeFilter } from "@/usecases/dto/practice.dto";
import type { ExamYearView as ExamYear } from "@/usecases/dto/question-query.dto";
import { BookIcon, CalendarIcon, PlayIcon, ShuffleIcon, SubjectIcon, TargetIcon } from "./icons";
import { Button, Card } from "./ui";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm ${
        active ? "border-primary bg-brand-soft font-medium text-brand" : "border-line bg-card hover:border-primary"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ icon, title, status, action, children }: { icon: ReactNode; title: string; status?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-3.5 py-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-brand">{icon}</span>
          {title}
          {status && <span className="font-normal text-muted">{status}</span>}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function toggle<T>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

function ClearButton({ show, onClick }: { show: boolean; onClick: () => void }) {
  if (!show) return null;
  return (
    <button type="button" onClick={onClick} className="text-xs text-muted hover:text-foreground">
      解除
    </button>
  );
}

export function PracticeForm({ years }: { years: ExamYear[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const { data } = usePracticeCatalog();
  const progress = useLearningRecord();
  const [filter, setFilter] = useState<PracticeFilter>(() => ({ ...parsePracticeFilter(params), ids: [] }));

  const update = (patch: Partial<PracticeFilter>) => setFilter((f) => ({ ...f, ...patch }));
  const counted = data && progress ? browserContainer.practiceSessionController.count(filter, data.catalog) : null;
  const pool = counted?.available ?? null;
  const size = counted?.selected ?? null;

  function toggleSession(session: Session) {
    const ids = SUBJECTS.filter((s) => s.session === session).map((s) => s.id);
    const all = ids.every((id) => filter.subjects.includes(id));
    const rest = filter.subjects.filter((id) => !ids.includes(id));
    update({ subjects: all ? rest : [...rest, ...ids] });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        router.push(practiceHref(filter));
      }}
    >
      <Card className="divide-y divide-line px-5 sm:px-6">
        <Field
          icon={<BookIcon size={16} />}
          title="科目"
          status={filter.subjects.length ? `${filter.subjects.length}科目` : "全科目"}
          action={<ClearButton show={filter.subjects.length > 0} onClick={() => update({ subjects: [] })} />}
        >
          <div className="space-y-3">
            {(["am", "pm"] as const).map((session) => (
              <div key={session} className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <button
                  type="button"
                  onClick={() => toggleSession(session)}
                  className="w-14 shrink-0 pt-2 text-left text-xs font-medium text-muted hover:text-brand"
                >
                  {SESSION_LABEL[session]}の部
                </button>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.filter((s) => s.session === session).map((s) => (
                    <Chip
                      key={s.id}
                      active={filter.subjects.includes(s.id)}
                      onClick={() => update({ subjects: toggle<SubjectId>(filter.subjects, s.id) })}
                    >
                      <SubjectIcon subject={s.id} size={16} />
                      {s.name}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Field>

        <Field
          icon={<CalendarIcon size={16} />}
          title="年度"
          status={filter.years.length ? `${filter.years.length}年度` : "全年度"}
          action={<ClearButton show={filter.years.length > 0} onClick={() => update({ years: [] })} />}
        >
          <div className="flex flex-wrap gap-2">
            {years.map((y) => (
              <Chip key={y.year} active={filter.years.includes(y.year)} onClick={() => update({ years: toggle(filter.years, y.year) })}>
                {y.label}
                <span className="text-xs opacity-60">{shortYearLabel(y.year)}</span>
              </Chip>
            ))}
          </div>
        </Field>

        <Field icon={<TargetIcon size={16} />} title="出題対象">
          <div className="flex flex-wrap gap-2">
            {TARGETS.map((t) => (
              <Chip key={t.id} active={filter.target === t.id} onClick={() => update({ target: t.id })}>
                {t.label}
              </Chip>
            ))}
          </div>
        </Field>

        <div className="grid gap-x-8 sm:grid-cols-2">
          <Field icon={<PlayIcon size={16} />} title="出題数">
            <div className="flex flex-wrap gap-2">
              {COUNTS.map((n) => (
                <Chip key={n} active={filter.count === n} onClick={() => update({ count: n })}>
                  {n === 0 ? "すべて" : `${n}肢`}
                </Chip>
              ))}
            </div>
          </Field>
          <Field icon={<ShuffleIcon size={16} />} title="出題順">
            <div className="flex flex-wrap gap-2">
              <Chip active={filter.order === "random"} onClick={() => update({ order: "random" })}>
                ランダム
              </Chip>
              <Chip active={filter.order === "sequential"} onClick={() => update({ order: "sequential" })}>
                年度・問題順
              </Chip>
            </div>
          </Field>
        </div>
      </Card>

      <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-line bg-card px-5 py-4 shadow-card">
        <p className="text-sm text-muted">
          {pool === null ? (
            "集計中"
          ) : (
            <>
              <span className="text-2xl font-semibold text-foreground tabular-nums">{size}</span> 肢
              {size !== pool && `（対象 ${pool} 肢）`}
            </>
          )}
        </p>
        <Button type="submit" size="lg" disabled={!pool}>
          <PlayIcon size={16} />
          演習を始める
        </Button>
      </div>
    </form>
  );
}
