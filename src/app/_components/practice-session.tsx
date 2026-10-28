"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLearningRecord } from "@/app/_hooks/use-learning-record";
import { usePracticeCatalog } from "@/app/_hooks/use-practice-catalog";
import { browserContainer } from "@/infrastructure/browser-container";
import type { CatalogIndex as Kakomon } from "@/presentation/shared/catalog-index";
import { answerLabels, SESSION_LABEL, shortYearLabel, statementLabel, subjectName } from "@/presentation/shared/formatters";
import { parsePracticeFilter, practiceHref, settingsHref, TARGETS } from "@/presentation/shared/practice-filter";
import type { LearningRecordView as Progress } from "@/usecases/dto/learning-record-query.dto";
import type { PracticeFilterInput as PracticeFilter } from "@/usecases/dto/practice.dto";
import { ArrowRightIcon, BookmarkIcon, CheckCircleIcon, ChevronIcon, CrossCircleIcon, ExternalIcon, ReviewIcon, ShuffleIcon, SlidersIcon } from "./icons";
import {
  DialogueContext,
  OriginalQuestion,
  QuestionContext,
  QuestionMeta,
  QuestionNote,
  QuestionNotes,
  StatementText,
  TruthIcon,
  TruthMark,
} from "./question-parts";
import { Button, ButtonLink, Card, Meter } from "./ui";

type RunState = {
  items: string[];
  index: number;
  picks: Record<string, boolean>;
};

const STORAGE_PREFIX = "dojo:session:";

function restore(storageKey: string, kakomon: Kakomon): RunState | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_PREFIX + storageKey);
    if (!raw) return null;
    const saved = JSON.parse(raw) as RunState;
    const items = saved.items.filter((id) => kakomon.itemById.has(id));
    if (items.length === 0 || saved.index >= items.length) return null;
    return { ...saved, items };
  } catch {
    return null;
  }
}

const { learningRecordController, practiceSessionController } = browserContainer;

function fresh(kakomon: Kakomon, filter: PracticeFilter): RunState {
  return { items: practiceSessionController.plan(filter, kakomon.catalog), index: 0, picks: {} };
}

function describe(filter: PracticeFilter): string {
  if (filter.ids.length) return "指定した肢";
  return [
    filter.subjects.length ? filter.subjects.map(subjectName).join("・") : "全科目",
    filter.years.length ? filter.years.map(shortYearLabel).join("・") : "全年度",
    TARGETS.find((t) => t.id === filter.target)?.label ?? "",
    filter.order === "random" ? "ランダム" : "年度・問題順",
  ].join(" / ");
}

export function PracticeSession() {
  const params = useSearchParams();
  const storageKey = params.toString();
  const { data, error } = usePracticeCatalog();
  const progress = useLearningRecord();

  if (error) return <p className="text-ng">{error.message}</p>;
  if (!data || !progress) return <SessionSkeleton />;
  return (
    <SessionRunner
      key={storageKey}
      kakomon={data}
      progress={progress}
      filter={parsePracticeFilter(new URLSearchParams(storageKey))}
      storageKey={storageKey}
    />
  );
}

export function SessionSkeleton() {
  return <div className="mx-auto h-96 max-w-3xl rounded-xl border border-line bg-surface" aria-busy />;
}

function SessionRunner({
  kakomon,
  progress,
  filter,
  storageKey,
}: {
  kakomon: Kakomon;
  progress: Progress;
  filter: PracticeFilter;
  storageKey: string;
}) {
  const [state, setState] = useState<RunState>(() => restore(storageKey, kakomon) ?? fresh(kakomon, filter));

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify(state));
    } catch (error) {
      console.warn("演習の途中経過を保存できませんでした", error);
    }
  }, [storageKey, state]);

  const total = state.items.length;
  const item = kakomon.itemById.get(state.items[state.index]);
  const pick = item ? state.picks[item.id] : undefined;
  const answered = pick !== undefined;
  const correctCount = state.items.filter((id) => {
    const p = state.picks[id];
    return p !== undefined && p === kakomon.itemById.get(id)?.statement.truth;
  }).length;

  function answer(value: boolean) {
    if (!item || answered) return;
    learningRecordController.recordAnswer(item.id, value === item.statement.truth);
    setState((s) => ({ ...s, picks: { ...s.picks, [item.id]: value } }));
  }

  function next() {
    setState((s) => ({ ...s, index: s.index + 1 }));
    window.scrollTo({ top: 0 });
  }

  function restart() {
    setState(fresh(kakomon, filter));
    window.scrollTo({ top: 0 });
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || !item) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("button, a, input, textarea, select, summary")) return;
      if (!answered) {
        if (["o", "O", "1", "ArrowLeft"].includes(event.key)) answer(true);
        if (["x", "X", "2", "ArrowRight"].includes(event.key)) answer(false);
      } else if (["Enter", " ", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        next();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (total === 0) {
    return (
      <Card className="mx-auto max-w-xl space-y-4 p-8 text-center">
        <p className="font-medium">条件に合う肢がありません</p>
        <p className="text-sm text-muted">{describe(filter)}</p>
        <ButtonLink href={settingsHref(filter)}>出題条件を変える</ButtonLink>
      </Card>
    );
  }

  if (!item) {
    return <SessionResult kakomon={kakomon} state={state} filter={filter} onRestart={restart} />;
  }

  const q = item.question;
  const labels = answerLabels(q.polarity);
  const record = progress.items[item.id];
  const bookmarked = progress.bookmarks[item.id] !== undefined;
  const ok = answered && pick === item.statement.truth;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="truncate text-muted">{describe(filter)}</span>
          <span className="shrink-0 tabular-nums">
            {state.index + 1} / {total}
            <span className="ml-3 text-muted">正解 {correctCount}</span>
          </span>
        </div>
        <Meter value={((state.index + (answered ? 1 : 0)) / total) * 100} label="進捗" />
      </div>

      <Card className="space-y-5 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <QuestionMeta q={q} statement={item.statement} />
          <button
            type="button"
            onClick={() => learningRecordController.toggleBookmark(item.id)}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? "ブックマークを外す" : "ブックマークする"}
            title={bookmarked ? "ブックマークを外す" : "ブックマークする"}
            className={`-m-1 shrink-0 rounded-md p-1 ${bookmarked ? "text-amber-500" : "text-muted hover:text-foreground"}`}
          >
            <BookmarkIcon size={20} filled={bookmarked} />
          </button>
        </div>
        <QuestionNote q={q} />
        <p className="text-sm leading-relaxed text-muted">{q.prompt ?? q.stem}</p>
        <QuestionContext q={q} />
        <DialogueContext statement={item.statement} />
        <div className="flex gap-3 border-l-[3px] border-primary pl-4">
          <span className="pt-0.5 text-lg font-semibold">{statementLabel(q, item.statement)}</span>
          <div className="min-w-0 flex-1">
            <StatementText statement={item.statement} size="lg" />
          </div>
        </div>
        <QuestionNotes q={q} />
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {([true, false] as const).map((value) => {
          const isTruth = value === item.statement.truth;
          const look = !answered ? "idle" : isTruth ? "truth" : pick === value ? "wrong" : "dim";
          return (
            <button
              key={String(value)}
              type="button"
              disabled={answered}
              onClick={() => answer(value)}
              className={`flex h-16 items-center justify-center gap-2 rounded-xl border text-base font-medium ${
                {
                  idle: "border-line bg-card shadow-card hover:border-primary",
                  truth: "border-ok bg-ok-soft text-ok",
                  wrong: "border-ng bg-ng-soft text-ng",
                  dim: "border-line bg-card text-muted",
                }[look]
              }`}
            >
              <span className={look === "idle" ? (value ? "text-ok" : "text-ng") : ""}>
                <TruthIcon truth={value} className="size-6" />
              </span>
              {value ? labels.yes : labels.no}
            </button>
          );
        })}
      </div>

      {answered && (
        <section className="space-y-4">
          <div className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-4 ${ok ? "border-ok/30 bg-ok-soft" : "border-ng/30 bg-ng-soft"}`}>
            <div className="flex items-center gap-3">
              <span className={ok ? "text-ok" : "text-ng"}>{ok ? <CheckCircleIcon size={32} /> : <CrossCircleIcon size={32} />}</span>
              <div>
                <p className={`text-lg font-semibold ${ok ? "text-ok" : "text-ng"}`}>{ok ? "正解" : "不正解"}</p>
                <p className="text-sm text-muted">
                  正解は「{item.statement.truth ? `○ ${labels.yes}` : `× ${labels.no}`}」
                  {record && `・通算 ${record.n}回中${record.c}回正解`}
                </p>
              </div>
            </div>
            <Button onClick={next} autoFocus size="lg">
              {state.index + 1 < total ? "次へ" : "結果を見る"}
              <ArrowRightIcon size={16} />
            </Button>
          </div>
          <details open={!ok} className="group rounded-xl border border-line bg-card shadow-card">
            <summary className="flex cursor-pointer select-none list-none items-center justify-between px-5 py-3.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
              元の問題
              <ChevronIcon size={16} className="text-muted group-open:rotate-180" />
            </summary>
            <div className="space-y-4 border-t border-line px-5 py-5">
              <OriginalQuestion q={q} highlight={item.index} showContext={false} />
              <Link href={`/questions/${q.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
                問題ページ
                <ExternalIcon size={14} />
              </Link>
            </div>
          </details>
        </section>
      )}
    </div>
  );
}

function SessionResult({
  kakomon,
  state,
  filter,
  onRestart,
}: {
  kakomon: Kakomon;
  state: RunState;
  filter: PracticeFilter;
  onRestart: () => void;
}) {
  const rows = state.items.flatMap((id) => {
    const item = kakomon.itemById.get(id);
    return item ? [{ item, ok: state.picks[id] === item.statement.truth }] : [];
  });
  const correct = rows.filter((r) => r.ok).length;
  const wrongIds = rows.filter((r) => !r.ok).map((r) => r.item.id);
  const percent = Math.round((correct / rows.length) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="space-y-5 p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-1">
            <p className="text-sm text-muted">{describe(filter)}</p>
            <p className="text-4xl font-semibold tracking-tight tabular-nums">
              {correct}
              <span className="text-xl font-normal text-muted"> / {rows.length}</span>
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-xs text-muted">正答率</p>
              <p className="text-2xl font-semibold tabular-nums">{percent}%</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-muted">
                <span className="text-ok">
                  <CheckCircleIcon size={14} />
                </span>
                正解
              </p>
              <p className="text-2xl font-semibold tabular-nums">{correct}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-muted">
                <span className="text-ng">
                  <CrossCircleIcon size={14} />
                </span>
                不正解
              </p>
              <p className="text-2xl font-semibold tabular-nums">{wrongIds.length}</p>
            </div>
          </div>
        </div>
        <Meter value={percent} label="正答率" />
        <div className="flex flex-wrap gap-2">
          {wrongIds.length > 0 && (
            <ButtonLink href={practiceHref({ ids: wrongIds, count: 0 })}>
              <ReviewIcon size={16} />
              間違えた{wrongIds.length}肢をもう一度
            </ButtonLink>
          )}
          <Button variant="secondary" onClick={onRestart}>
            <ShuffleIcon size={16} />
            同じ条件でもう一度
          </Button>
          <ButtonLink href={settingsHref(filter)} variant="ghost">
            <SlidersIcon size={16} />
            条件を変える
          </ButtonLink>
        </div>
      </Card>
      <Card className="divide-y divide-line">
        {rows.map(({ item, ok }) => (
          <Link key={item.id} href={`/questions/${item.question.id}`} className="flex items-start gap-4 px-5 py-3.5 hover:bg-surface">
            <span className={`mt-0.5 shrink-0 ${ok ? "text-ok" : "text-ng"}`} aria-label={ok ? "正解" : "不正解"}>
              {ok ? <CheckCircleIcon size={20} /> : <CrossCircleIcon size={20} />}
            </span>
            <span className="min-w-0 flex-1 space-y-0.5">
              <span className="block text-xs text-muted">
                {shortYearLabel(item.question.year)} {SESSION_LABEL[item.question.session]} 第{item.question.number}問{" "}
                {statementLabel(item.question, item.statement)} · {subjectName(item.question.subject)}
              </span>
              <span className="line-clamp-2 text-sm leading-relaxed">{item.statement.text}</span>
            </span>
            <TruthMark truth={item.statement.truth} />
          </Link>
        ))}
      </Card>
    </div>
  );
}
