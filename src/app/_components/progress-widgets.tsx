"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLearningRecord } from "@/app/_hooks/use-learning-record";
import { DateKey } from "@/domain/values/date-key.vo";
import { accuracyRate as rate } from "@/presentation/shared/formatters";
import { dailyCount, studyStreak, summarize } from "@/presentation/shared/learning-summary";
import type { LearningRecordView as Progress } from "@/usecases/dto/learning-record-query.dto";
import { CalendarIcon, FlameIcon, ReviewIcon, TargetIcon } from "./icons";
import { Card, Meter } from "./ui";

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>;
}

export function StatCell({ icon, label, value, sub }: { icon: ReactNode; label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <Card className="space-y-2 p-4 sm:p-5">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
        <span className="text-brand">{icon}</span>
        {label}
      </p>
      <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </Card>
  );
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function WeekChart({ progress }: { progress: Progress }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const record = progress.daily[DateKey.of(date).value];
    return { date, n: record?.n ?? 0, c: record?.c ?? 0, today: i === 6 };
  });
  const top = Math.max(10, ...days.map((d) => d.n));
  const total = days.reduce((sum, d) => sum + d.n, 0);

  return (
    <div className="hidden rounded-xl border border-line bg-surface p-4 sm:block">
      <div className="mb-3 flex items-baseline justify-between text-xs">
        <span className="font-medium text-muted">直近7日</span>
        <span className="tabular-nums text-muted">
          計 <span className="font-semibold text-foreground">{total}</span> 肢
        </span>
      </div>
      <div className="grid h-24 grid-cols-7 items-end gap-2">
        {days.map((d) => (
          <div
            key={d.date.toISOString()}
            title={`${d.date.getMonth() + 1}/${d.date.getDate()} ${d.n}肢${d.n ? `・正答率${rate(d.c, d.n)}%` : ""}`}
            className="flex h-full flex-col items-center justify-end gap-1"
          >
            {d.today && d.n > 0 && <span className="text-[10px] font-semibold tabular-nums">{d.n}</span>}
            <div
              className={`w-full max-w-5 rounded-t ${d.today ? "bg-primary" : "bg-primary/35"}`}
              style={{ height: `${Math.max(d.n ? 6 : 2, (d.n / top) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-7 gap-2 text-center text-[10px] text-muted">
        {days.map((d) => (
          <span key={d.date.toISOString()} className={d.today ? "font-semibold text-foreground" : ""}>
            {WEEKDAYS[d.date.getDay()]}
          </span>
        ))}
      </div>
    </div>
  );
}

function BandStat({ icon, label, value, unit, sub }: { icon: ReactNode; label: string; value: string; unit: string; sub?: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-muted">
        <span className="text-brand">{icon}</span>
        {label}
      </dt>
      <dd className="text-3xl font-semibold tracking-tight tabular-nums">
        {value}
        <span className="ml-0.5 text-base font-normal text-muted">{unit}</span>
      </dd>
      {sub && <dd className="text-xs text-muted">{sub}</dd>}
    </div>
  );
}

export function TodayBand({ total }: { total: number }) {
  const progress = useLearningRecord();
  const s = progress ? summarize(progress) : null;
  const today = progress ? dailyCount(progress, new Date()) : undefined;
  const accuracy = s ? rate(s.correct, s.attempts) : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-center">
      <div className="space-y-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
          <BandStat
            icon={<CalendarIcon size={16} />}
            label="今日の解答"
            value={`${today?.n ?? 0}`}
            unit="肢"
            sub={today ? `正答率 ${rate(today.c, today.n)}%` : undefined}
          />
          <BandStat
            icon={<TargetIcon size={16} />}
            label="累計正答率"
            value={accuracy === null ? "—" : `${accuracy}`}
            unit={accuracy === null ? "" : "%"}
            sub={s ? `延べ ${s.attempts.toLocaleString()} 回` : undefined}
          />
          <BandStat
            icon={<ReviewIcon size={16} />}
            label="要復習"
            value={`${s?.review ?? 0}`}
            unit="肢"
            sub={
              s && s.review > 0 ? (
                <Link href="/review" className="font-medium text-brand hover:underline">
                  一覧を見る
                </Link>
              ) : undefined
            }
          />
          <BandStat icon={<FlameIcon size={16} />} label="連続学習" value={`${progress ? studyStreak(progress, new Date()) : 0}`} unit="日" />
        </dl>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted">
            <span>解答済み</span>
            <span className="tabular-nums">
              <span className="font-semibold text-foreground">{(s?.answered ?? 0).toLocaleString()}</span> / {total.toLocaleString()} 肢
            </span>
          </div>
          <Meter value={s ? (s.answered / total) * 100 : 0} label="解答済みの割合" />
        </div>
      </div>
      {progress ? <WeekChart progress={progress} /> : <div className="hidden h-[170px] rounded-xl border border-line bg-surface sm:block" />}
    </div>
  );
}
