"use client";

import Link from "next/link";
import { useState } from "react";
import { practiceHref } from "@/presentation/shared/practice-filter";
import { useLearningRecord } from "@/app/_hooks/use-learning-record";
import { usePracticeCatalog } from "@/app/_hooks/use-practice-catalog";
import { SUBJECTS } from "@/domain/constants/subjects";
import type { SubjectId } from "@/domain/shared/subject.types";
import { browserContainer } from "@/infrastructure/browser-container";
import type { CatalogItem as Item } from "@/presentation/shared/catalog-index";
import { monthDay, SESSION_LABEL, shortYearLabel, statementLabel, subjectName } from "@/presentation/shared/formatters";
import type { LearningRecordView as Progress } from "@/usecases/dto/learning-record-query.dto";
import { BookmarkIcon, InboxIcon, PlayIcon, SubjectIcon } from "./icons";
import { TruthMark } from "./question-parts";
import { Button, ButtonLink } from "./ui";

type Tab = "review" | "missed" | "bookmark";

const TABS: { id: Tab; label: string }[] = [
  { id: "review", label: "要復習" },
  { id: "missed", label: "誤答歴あり" },
  { id: "bookmark", label: "ブックマーク" },
];

const PAGE_SIZE = 50;

function matches(tab: Tab, item: Item, progress: Progress): boolean {
  const record = progress.items[item.id];
  if (tab === "review") return record?.needsReview ?? false;
  if (tab === "missed") return record?.everMissed ?? false;
  return progress.bookmarks[item.id] !== undefined;
}

export function ReviewList() {
  const { data, error } = usePracticeCatalog();
  const progress = useLearningRecord();
  const [tab, setTab] = useState<Tab>("review");
  const [subject, setSubject] = useState<SubjectId | "all">("all");
  const [limit, setLimit] = useState(PAGE_SIZE);

  if (error) return <p className="text-ng">{error.message}</p>;
  if (!data || !progress) return <div className="h-96" aria-busy />;

  const counts = Object.fromEntries(
    TABS.map((t) => [t.id, data.items.filter((item) => matches(t.id, item, progress)).length]),
  ) as Record<Tab, number>;
  const sortKey = (item: Item) =>
    tab === "bookmark" ? (progress.bookmarks[item.id] ?? 0) : (progress.items[item.id]?.at ?? 0);
  const items = data.items
    .filter((item) => matches(tab, item, progress) && (subject === "all" || item.question.subject === subject))
    .sort((a, b) => sortKey(b) - sortKey(a));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line">
        <div className="flex gap-5" role="tablist">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => {
                setTab(id);
                setLimit(PAGE_SIZE);
              }}
              className={`-mb-px border-b-2 pb-2.5 text-sm ${
                tab === id ? "border-primary font-medium text-brand" : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {label}
              <span className="ml-1.5 tabular-nums text-muted">{counts[id]}</span>
            </button>
          ))}
        </div>
        <select
          value={subject}
          onChange={(event) => {
            setSubject(event.target.value as SubjectId | "all");
            setLimit(PAGE_SIZE);
          }}
          className="mb-2 h-8 rounded-lg border border-line bg-card px-2 text-sm shadow-card"
          aria-label="科目"
        >
          <option value="all">全科目</option>
          {SUBJECTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="text-muted">
            <InboxIcon size={40} strokeWidth={1.25} />
          </span>
          <p className="text-sm text-muted">{tab === "bookmark" ? "ブックマークした肢はありません" : "該当する肢はありません"}</p>
          <ButtonLink href="/" variant="secondary">
            演習する
          </ButtonLink>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">
              <span className="font-medium text-foreground tabular-nums">{items.length}</span> 肢
            </p>
            <ButtonLink href={practiceHref({ target: tab, subjects: subject === "all" ? [] : [subject], count: 0 })}>
              <PlayIcon size={16} />
              まとめて解き直す
            </ButtonLink>
          </div>
          <ul className="divide-y divide-line rounded-xl border border-line bg-card px-4 shadow-card sm:px-5">
            {items.slice(0, limit).map((item) => {
              const q = item.question;
              const record = progress.items[item.id];
              const bookmarked = progress.bookmarks[item.id] !== undefined;
              return (
                <li key={item.id} className="flex items-start gap-3 py-4">
                  <span className="mt-0.5 text-brand">
                    <SubjectIcon subject={q.subject} size={20} />
                  </span>
                  <Link href={`/questions/${q.id}`} className="min-w-0 flex-1 space-y-1">
                    <span className="block text-xs text-muted">
                      {shortYearLabel(q.year)} {SESSION_LABEL[q.session]} 第{q.number}問 {statementLabel(q, item.statement)} · {subjectName(q.subject)}
                      {q.topic && ` · ${q.topic}`}
                    </span>
                    <span className="line-clamp-3 leading-relaxed hover:underline">{item.statement.text}</span>
                    {record && (
                      <span className="block text-xs text-muted">
                        {record.n}回中{record.c}回正解 · 最終 {monthDay(record.at)}
                        <span className={record.last ? "text-ok" : "text-ng"}>（{record.last ? "正解" : "不正解"}）</span>
                      </span>
                    )}
                  </Link>
                  <TruthMark truth={item.statement.truth} />
                  <button
                    type="button"
                    onClick={() => browserContainer.learningRecordController.toggleBookmark(item.id)}
                    aria-pressed={bookmarked}
                    aria-label={bookmarked ? "ブックマークを外す" : "ブックマークする"}
                    title={bookmarked ? "ブックマークを外す" : "ブックマークする"}
                    className={`rounded-md p-0.5 ${bookmarked ? "text-amber-500" : "text-muted hover:text-foreground"}`}
                  >
                    <BookmarkIcon size={18} filled={bookmarked} />
                  </button>
                </li>
              );
            })}
          </ul>
          {items.length > limit && (
            <Button variant="secondary" className="w-full" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
              さらに表示（残り {items.length - limit} 肢）
            </Button>
          )}
        </>
      )}
    </div>
  );
}
