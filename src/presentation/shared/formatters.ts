import { SUBJECTS } from "@/domain/constants/subjects";
import type { Session } from "@/domain/shared/exam.types";
import type { Polarity, QuestionKind } from "@/domain/shared/question.types";
import type { SubjectId } from "@/domain/shared/subject.types";

export const SESSION_LABEL: Record<Session, string> = { am: "午前", pm: "午後" };

export function yearLabel(year: number): string {
  if (year >= 2020) return `令和${year - 2018}年度`;
  if (year === 2019) return "令和元年度";
  return `平成${year - 1988}年度`;
}

export function shortYearLabel(year: number): string {
  if (year >= 2019) return `R${year - 2018}`;
  return `H${year - 1988}`;
}

export function subjectName(id: SubjectId): string {
  return SUBJECTS.find((s) => s.id === id)?.name ?? id;
}

export function questionTitle(q: { year: number; session: Session; number: number }): string {
  return `${yearLabel(q.year)} ${SESSION_LABEL[q.session]} 第${q.number}問`;
}

export function statementLabel(q: { kind?: QuestionKind }, statement: { label: string }): string {
  return q.kind === "single" ? `肢${statement.label}` : statement.label;
}

export function answerLabels(polarity: Polarity | null | undefined): { yes: string; no: string } {
  return polarity === "match" ? { yes: "当たる", no: "当たらない" } : { yes: "正しい", no: "誤り" };
}

export function accuracyRate(correct: number, attempts: number): number | null {
  return attempts === 0 ? null : Math.round((correct / attempts) * 100);
}

export function monthDay(time: number): string {
  return new Date(time).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}
