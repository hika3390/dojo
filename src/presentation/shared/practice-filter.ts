import { isSubjectId } from "@/domain/constants/subjects";
import type { PracticeTarget } from "@/domain/shared/practice.types";
import type { PracticeFilterInput } from "@/usecases/dto/practice.dto";

export const TARGETS: { id: PracticeTarget; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "unanswered", label: "未解答" },
  { id: "review", label: "要復習" },
  { id: "missed", label: "誤答歴あり" },
  { id: "bookmark", label: "ブックマーク" },
];

const MIN_COUNT = 100;

export const COUNTS = [MIN_COUNT, 200, 500, 0];

export const DEFAULT_FILTER: PracticeFilterInput = {
  years: [],
  subjects: [],
  target: "all",
  count: MIN_COUNT,
  order: "random",
  ids: [],
};

function list(params: URLSearchParams, key: string): string[] {
  return (params.get(key) ?? "").split(",").filter(Boolean);
}

export function parsePracticeFilter(params: URLSearchParams): PracticeFilterInput {
  const target = params.get("target");
  const count = params.has("count") ? Number(params.get("count")) : DEFAULT_FILTER.count;
  return {
    years: list(params, "years").map(Number).filter(Number.isInteger),
    subjects: list(params, "subjects").filter(isSubjectId),
    target: TARGETS.some((t) => t.id === target) ? (target as PracticeTarget) : DEFAULT_FILTER.target,
    count: !Number.isInteger(count) || count < 0 ? DEFAULT_FILTER.count : count === 0 ? 0 : Math.max(MIN_COUNT, count),
    order: params.get("order") === "sequential" ? "sequential" : "random",
    ids: list(params, "ids"),
  };
}

function filterQuery(filter: Partial<PracticeFilterInput>): string {
  const f = { ...DEFAULT_FILTER, ...filter };
  const params = new URLSearchParams();
  if (f.ids.length) {
    params.set("ids", f.ids.join(","));
  } else {
    if (f.years.length) params.set("years", f.years.join(","));
    if (f.subjects.length) params.set("subjects", f.subjects.join(","));
    if (f.target !== "all") params.set("target", f.target);
  }
  params.set("count", String(f.count));
  if (f.order !== "random") params.set("order", f.order);
  return params.toString().replaceAll("%2C", ",");
}

export function practiceHref(filter: Partial<PracticeFilterInput>): string {
  return `/practice/session?${filterQuery(filter)}`;
}

export function settingsHref(filter: Partial<PracticeFilterInput>): string {
  return filter.ids?.length ? "/" : `/?${filterQuery(filter)}`;
}
