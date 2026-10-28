"use client";

import { useState, type ReactNode } from "react";
import { useLearningRecord } from "@/app/_hooks/use-learning-record";
import { accuracyRate as rate } from "@/presentation/shared/formatters";
import { EyeIcon } from "./icons";
import { Button } from "./ui";

export function RevealToggle({ children }: { children: ReactNode }) {
  const [reveal, setReveal] = useState(true);
  return (
    <div data-reveal={reveal} className="group/reveal space-y-3">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setReveal((v) => !v)} aria-pressed={!reveal}>
          <EyeIcon size={16} off={reveal} />
          {reveal ? "正解を隠す" : "正解を表示"}
        </Button>
      </div>
      {children}
    </div>
  );
}

export function ItemHistory({ items }: { items: { id: string; label: string }[] }) {
  const progress = useLearningRecord();
  if (!progress || items.every((item) => !progress.items[item.id])) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">成績</h2>
      <div className="grid grid-cols-5 gap-px overflow-hidden rounded-xl border border-line bg-line text-center text-xs">
        {items.map((item) => {
          const record = progress.items[item.id];
          return (
            <div key={item.id} className="space-y-0.5 bg-card px-2 py-3">
              <p className="font-medium">{item.label}</p>
              {record ? (
                <p className={record.last ? "text-ok" : "text-ng"}>
                  {record.c}/{record.n}
                  <span className="hidden sm:inline">（{rate(record.c, record.n)}%）</span>
                </p>
              ) : (
                <p className="text-muted">—</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
