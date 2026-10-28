import type { Session } from "../shared/exam.types";
import type { SubjectId } from "../shared/subject.types";

export type Subject = {
  id: SubjectId;
  name: string;
  session: Session;
  from: number;
  to: number;
};

export const SUBJECTS: readonly Subject[] = [
  { id: "kenpo", name: "憲法", session: "am", from: 1, to: 3 },
  { id: "minpo", name: "民法", session: "am", from: 4, to: 23 },
  { id: "keiho", name: "刑法", session: "am", from: 24, to: 26 },
  { id: "shoho", name: "会社法・商法", session: "am", from: 27, to: 35 },
  { id: "minso", name: "民事訴訟法", session: "pm", from: 1, to: 5 },
  { id: "hozen", name: "民事保全法", session: "pm", from: 6, to: 6 },
  { id: "shikko", name: "民事執行法", session: "pm", from: 7, to: 7 },
  { id: "shoshi", name: "司法書士法", session: "pm", from: 8, to: 8 },
  { id: "kyotaku", name: "供託法", session: "pm", from: 9, to: 11 },
  { id: "fudosan", name: "不動産登記法", session: "pm", from: 12, to: 27 },
  { id: "shogyo", name: "商業登記法", session: "pm", from: 28, to: 35 },
];

export const QUESTIONS_PER_SESSION = 35;

export function isSubjectId(value: string): value is SubjectId {
  return SUBJECTS.some((s) => s.id === value);
}

export function subjectAt(session: Session, number: number): SubjectId {
  const found = SUBJECTS.find((s) => s.session === session && s.from <= number && number <= s.to);
  if (!found) throw new Error(`問題番号に対応する科目がありません: ${session} ${number}`);
  return found.id;
}
