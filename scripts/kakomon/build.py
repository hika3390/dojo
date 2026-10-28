#!/usr/bin/env python3
"""司法書士試験の問題PDFを解析し、肢別（○×）データを data/kakomon/ に出力する。"""
from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass, field
from pathlib import Path

import pymupdf

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
LABELS = "アイウエオ"
FOOTER_Y = 760
PARAGRAPH_END_X = 520
MIN_FONT_SIZE = 7
FIGURE_MIN_DRAWINGS = 20
FULLWIDTH_DIGITS = str.maketrans("０１２３４５６７８９", "0123456789")

SUBJECT_RANGES = {
    "am": [(1, 3, "kenpo"), (4, 23, "minpo"), (24, 26, "keiho"), (27, 35, "shoho")],
    "pm": [
        (1, 5, "minso"),
        (6, 6, "hozen"),
        (7, 7, "shikko"),
        (8, 8, "shoshi"),
        (9, 11, "kyotaku"),
        (12, 27, "fudosan"),
        (28, 35, "shogyo"),
    ],
}

QUESTION_HEAD = re.compile(r"^第(\d+)問(?!から)")
NOTE_START = re.compile(r"^(以下の試験問題|(また、)?第\d+問から第\d+問までの試験問題)")
NOTE_SENTENCE = re.compile(r"(?:以下の|第(\d+)問から第(\d+)問までの)試験問題については、.*?解答してください。")
CHOICE_ROW = re.compile(r"^1[\s　]*[アイウエオ]{2,3}")
CHOICE_CONTINUED = re.compile(r"^[1-5][\s　]*[アイウエオ]{2,3}")
CHOICE_ITEM = re.compile(r"([1-5])[\s　]*([アイウエオ]{2,3})")
SPEAKER_QUESTION = re.compile(r"^(教授|司法書士)：")
PROMPT = {
    "combo": re.compile(r"次のアからオまでの(?:各)?(.+?)のうち、(.*?)ものの組合せは、.*?どれか。$"),
    "single": re.compile(r"次の1から5までの(?:各)?(.+?)のうち、(.*?)ものは、どれか。$"),
}
TOPIC_PATTERNS = [
    re.compile(r"^次の対話は、(.+?)に関する"),
    re.compile(r"^(.+?)に関する次の"),
    re.compile(r"^(.+?)についての次の"),
]


@dataclass
class Line:
    page: int
    x0: float
    y0: float
    x1: float
    text: str


@dataclass
class Row:
    page: int
    y0: float
    lines: list[Line] = field(default_factory=list)

    @property
    def x0(self) -> float:
        return self.lines[0].x0

    @property
    def x1(self) -> float:
        return max(line.x1 for line in self.lines)

    @property
    def text(self) -> str:
        out = ""
        for prev, line in zip([None, *self.lines], self.lines):
            if prev is not None and line.x0 - prev.x1 > 4:
                out += " "
            out += line.text
        return clean(out)


def clean(s: str) -> str:
    s = s.translate(FULLWIDTH_DIGITS).replace("，", "、").replace("．", "。")
    s = re.sub(r"[\x00-\x08\x0b-\x1f\x7f]", "", s)
    s = re.sub(r"[ \t ]+", " ", s)
    s = re.sub(r"(?<=[^\x00-\x7f]) (?=[^\x00-\x7f])", "", s)
    s = re.sub(r"(?<=\d) (?=[^\x00-\x7f])", "", s)
    s = re.sub(r"(?<=[^\x00-\x7f]) (?=\d)", "", s)
    return s.strip()


def read_rows(path: Path) -> list[Row]:
    rows: list[Row] = []
    for pno, page in enumerate(pymupdf.open(path), 1):
        lines = []
        for block in page.get_text("dict")["blocks"]:
            if block["type"] != 0:
                continue
            for raw in block["lines"]:
                text = "".join(span["text"] for span in raw["spans"] if span["size"] >= MIN_FONT_SIZE)
                x0, y0, x1, _ = raw["bbox"]
                if text.strip() and y0 < FOOTER_Y:
                    lines.append(Line(pno, x0, y0, x1, text))
        lines.sort(key=lambda line: line.y0)
        page_rows: list[Row] = []
        for line in lines:
            if page_rows and abs(page_rows[-1].y0 - line.y0) < 3:
                page_rows[-1].lines.append(line)
            else:
                page_rows.append(Row(pno, line.y0, [line]))
        for row in page_rows:
            row.lines.sort(key=lambda line: line.x0)
        rows.extend(page_rows)
    return rows


def join_rows(rows: list[Row]) -> str:
    out = ""
    for i, row in enumerate(rows):
        out += row.text
        if i < len(rows) - 1 and row.x1 < PARAGRAPH_END_X:
            out += "\n"
    return out.strip()


def split_questions(rows: list[Row]) -> list[tuple[int, list[Row]]]:
    questions: list[tuple[int, list[Row]]] = []
    for row in rows:
        m = QUESTION_HEAD.match(row.text) if row.x0 < 80 else None
        if m and int(m.group(1)) == len(questions) + 1:
            questions.append((int(m.group(1)), [row]))
        elif questions:
            questions[-1][1].append(row)
    return [(n, rs) for n, rs in questions if n <= 35]


def parse_notes(rows: list[Row]) -> list[tuple[int | None, int | None, str]]:
    text = "".join(row.text for row in rows)
    return [
        (int(m.group(1)) if m.group(1) else None, int(m.group(2)) if m.group(2) else None, m.group(0))
        for m in NOTE_SENTENCE.finditer(text)
    ]


def label_of(row: Row, label: str) -> bool:
    if label.isdigit():
        return row.x0 < 105 and re.match(rf"^{label}(?![\d年月日条項号])", row.text) is not None
    if clean(row.lines[0].text) == label:
        return True
    return re.match(rf"^(?:(?:学生|補助者)：)?[\s　]*{label}[\s　]", row.text) is not None


def strip_label(text: str, label: str) -> str:
    return re.sub(rf"^(?:(?:学生|補助者)：)?[\s　]*{label}[\s　]*", "", text)


def kind_of(stem: str) -> str:
    return "single" if PROMPT["single"].search(stem) else "combo"


def is_table_header(row: Row) -> bool:
    return len(row.lines) >= 2 and all(len(clean(line.text)) <= 15 for line in row.lines) and any("欄" in line.text for line in row.lines)


def table_text(rows: list[Row], label: str, header: Row) -> str:
    centers = [(line.x0 + line.x1) / 2 for line in header.lines]
    bounds = [(a + b) / 2 for a, b in zip(centers, centers[1:])]
    cells: list[list[str]] = [[] for _ in header.lines]
    for row in rows:
        for line in row.lines:
            if line.text.strip() == label:
                continue
            col = sum(1 for b in bounds if line.x0 > b)
            cells[col].append(clean(line.text))
    return "\n".join(f"【{clean(h.text)}】{''.join(c)}" for h, c in zip(header.lines, cells))


def subject_of(session: str, number: int) -> str:
    return next(s for lo, hi, s in SUBJECT_RANGES[session] if lo <= number <= hi)


def topic_of(stem: str) -> str | None:
    for pattern in TOPIC_PATTERNS:
        m = pattern.search(stem)
        if m and len(m.group(1)) <= 30 and "次の" not in m.group(1):
            return m.group(1)
    return None


def polarity_of(stem: str, kind: str) -> str | None:
    target = "ものの組合せ" if kind == "combo" else "ものは、どれか"
    if "正しい" + target in stem:
        return "correct"
    if "誤っている" + target in stem:
        return "incorrect"
    if target in stem:
        return "match"
    return None


def prompt_of(stem: str, kind: str, polarity: str | None) -> str | None:
    m = PROMPT[kind].search(stem)
    if not m or polarity is None:
        return None
    cond = m.group(2)
    if polarity != "match":
        cond = re.sub(r"(正しい|誤っている)$", "正しい", cond)
    return f"{stem[: m.start()]}次の{m.group(1)}は、{cond}か。"


def parse_question(year: int, session: str, number: int, rows: list[Row]) -> dict:
    qid = f"{year}-{session}-{number:02d}"
    question: dict = {
        "id": qid,
        "year": year,
        "session": session,
        "number": number,
        "subject": subject_of(session, number),
        "page": rows[0].page,
    }

    acc = ""
    stem_end = None
    for i, row in enumerate(rows):
        acc += row.text
        if "どれか。" in acc:
            stem_end = i
            break
    if stem_end is None:
        return {**question, "supported": False, "issue": "柱書を特定できません"}
    stem, _, rest = re.sub(r"^第\d+問[\s　]*", "", acc).partition("どれか。")
    stem += "どれか。"
    question["stem"] = stem
    question["topic"] = topic_of(stem)
    question["kind"] = kind = kind_of(stem)
    labels = LABELS if kind == "combo" else "12345"

    preamble: list[str] = [rest] if rest.strip() else []
    preamble_rows: list[Row] = []
    reference_rows: list[Row] = []
    statements: list[dict] = []
    choice_text = ""
    contexts: list[list[Row]] = []
    header: Row | None = None
    mode = "preamble"

    for row in rows[stem_end + 1 :]:
        text = row.text
        expect = len(statements)
        if mode == "choices":
            if CHOICE_CONTINUED.match(text):
                choice_text += text
                continue
            break
        if kind == "combo" and expect == 5 and CHOICE_ROW.match(text):
            mode = "choices"
            choice_text += text
            continue
        if expect < 5 and label_of(row, labels[expect]):
            statements.append({"label": labels[expect], "rows": [row], "context": contexts})
            contexts = []
            mode = "statement"
            continue
        if SPEAKER_QUESTION.match(text):
            contexts.append([row])
            mode = "speaker"
            continue
        if text.startswith("（参考）"):
            reference_rows.append(row)
            mode = "reference"
            continue
        if mode == "preamble" and is_table_header(row):
            header = row
            continue
        if mode == "preamble":
            preamble_rows.append(row)
        elif mode == "statement":
            statements[-1]["rows"].append(row)
        elif mode == "speaker":
            contexts[-1].append(row)
        elif mode == "reference":
            reference_rows.append(row)

    if preamble_rows:
        question["_preamble_rows"] = preamble_rows
        preamble.append(join_rows(preamble_rows))
    if preamble:
        question["preamble"] = "\n".join(p.strip() for p in preamble)
    if reference_rows:
        question["reference"] = join_rows(reference_rows)
    if header is not None:
        question["columns"] = [clean(line.text) for line in header.lines]

    parsed = []
    for st in statements:
        if header is not None:
            text = table_text(st["rows"], st["label"], header)
        else:
            text = strip_label(join_rows(st["rows"]), st["label"])
        item = {"label": st["label"], "text": text}
        if st["context"]:
            item["context"] = "\n".join(re.sub(r"：[\s　]*", "：", join_rows(c), count=1) for c in st["context"])
        parsed.append(item)
    question["statements"] = parsed

    if kind == "combo":
        choices = [list(letters) for _, letters in sorted(CHOICE_ITEM.findall(choice_text))]
        choice_numbers = [n for n, _ in sorted(CHOICE_ITEM.findall(choice_text))]
    else:
        choices = [[label] for label in labels]
        choice_numbers = list(labels)
    question["choices"] = choices
    question["polarity"] = polarity_of(stem, kind)
    question["prompt"] = prompt_of(stem, kind, question["polarity"])

    issues = []
    if len(parsed) != 5:
        issues.append(f"肢が{len(parsed)}個しか見つかりません")
    elif any(len(s["text"]) < 8 and "context" not in s for s in parsed):
        issues.append("肢の本文が短すぎます（語句選択問題など）")
    if len(choices) != 5 or choice_numbers != list("12345"):
        issues.append("選択肢（組合せ）を解析できません")
    if question["polarity"] is None:
        issues.append("正誤の向きを判定できません")
    if "空欄" in stem:
        issues.append("空欄補充問題のため対象外")
    question["supported"] = not issues
    if issues:
        question["issue"] = "、".join(issues)
    return question


def parse_answers(path: Path) -> dict[str, list[int | None]]:
    text = clean("\n".join(page.get_text() for page in pymupdf.open(path)))
    seen: dict[int, int] = {}
    result: dict[str, list[int | None]] = {"am": [None] * 35, "pm": [None] * 35}
    for m in re.finditer(r"第\s*(\d+)\s*問\s*([1-5\-－―])", text):
        n = int(m.group(1))
        seen[n] = seen.get(n, 0) + 1
        session = "am" if seen[n] == 1 else "pm"
        value = m.group(2)
        if 1 <= n <= 35 and seen[n] <= 2:
            result[session][n - 1] = int(value) if value.isdigit() else None
    return result


def apply_answer(question: dict, answer: int | None, override: dict | None) -> None:
    question["answer"] = answer
    if override:
        question.update({k: v for k, v in override.items() if k != "truths"})
    if not question["supported"]:
        return
    truths = override.get("truths") if override else None
    if truths is None:
        if answer is None:
            question["supported"] = False
            question["issue"] = "正解が公表されていません"
            return
        selected = set(question["choices"][answer - 1])
        truths = [
            (s["label"] in selected) != (question["polarity"] == "incorrect")
            for s in question["statements"]
        ]
    for statement, truth in zip(question["statements"], truths):
        statement["truth"] = truth


def render_figure(question: dict, doc: pymupdf.Document, figure_dir: Path) -> None:
    rows: list[Row] = question.pop("_preamble_rows", [])
    if len({row.page for row in rows}) != 1:
        return
    page = doc[rows[0].page - 1]
    clip = pymupdf.Rect(55, rows[0].y0 - 6, 545, rows[-1].y0 + 20)
    if sum(1 for d in page.get_drawings() if clip.y0 <= d["rect"].y0 <= clip.y1) < FIGURE_MIN_DRAWINGS:
        return
    figure_dir.mkdir(parents=True, exist_ok=True)
    pixmap = page.get_pixmap(clip=clip, dpi=200)
    pixmap.save(figure_dir / f"{question['id']}.png")
    question["figure"] = f"/kakomon/figures/{question['id']}.png"
    question["figureSize"] = [pixmap.width, pixmap.height]
    lead = question["preamble"].split("\n")[0] if question.get("preamble", "").startswith("なお") else ""
    if lead and lead in join_rows(rows):
        lead = ""
    if lead:
        question["preamble"] = lead
    else:
        question.pop("preamble", None)


def build_year(src: dict, pdf_dir: Path, overrides: dict, figure_dir: Path) -> dict:
    year = src["year"]
    answer_override = overrides["answers"].get(str(year))
    answers = answer_override if answer_override else parse_answers(pdf_dir / f"{year}_answers.pdf")
    questions = []
    for session in ("am", "pm"):
        notes: list[tuple[int | None, int | None, str]] = []
        pdf = pdf_dir / f"{year}_{session}.pdf"
        doc = pymupdf.open(pdf)
        for number, rows in split_questions(read_rows(pdf)):
            note_at = next((i for i, row in enumerate(rows) if i > 0 and NOTE_START.match(row.text)), None)
            body = rows if note_at is None else rows[:note_at]
            question = parse_question(year, session, number, body)
            if question["supported"]:
                render_figure(question, doc, figure_dir)
            question.pop("_preamble_rows", None)
            applicable = [text for lo, hi, text in notes if lo is None or lo <= number <= hi]
            if applicable:
                question["notes"] = applicable
            apply_answer(question, answers[session][number - 1], overrides["questions"].get(question["id"]))
            questions.append(question)
            if note_at is not None:
                notes.extend(parse_notes(rows[note_at:]))
    return {
        "year": year,
        "label": src["label"],
        "source": {k: src[k] for k in ("page", "am", "pm", "answers")},
        "questions": questions,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf-dir", type=Path, default=ROOT / ".cache" / "kakomon")
    parser.add_argument("--out-dir", type=Path, default=ROOT / "src" / "infrastructure" / "data" / "kakomon")
    parser.add_argument("--figure-dir", type=Path, default=ROOT / "public" / "kakomon" / "figures")
    parser.add_argument("--year", type=int, action="append")
    args = parser.parse_args()

    sources = json.loads((HERE / "sources.json").read_text())
    overrides = json.loads((HERE / "overrides.json").read_text())
    args.out_dir.mkdir(parents=True, exist_ok=True)
    for src in sources:
        if args.year and src["year"] not in args.year:
            continue
        data = build_year(src, args.pdf_dir, overrides, args.figure_dir)
        out = args.out_dir / f"{src['year']}.json"
        out.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
        qs = data["questions"]
        ok = [q for q in qs if q["supported"]]
        print(f"{src['year']}: {len(ok)}/{len(qs)} 問を肢別化")
        for q in qs:
            if not q["supported"]:
                print(f"  - {q['id']}: {q.get('issue')}")
    write_index(args.out_dir)


def write_index(out_dir: Path) -> None:
    years = sorted((int(p.stem) for p in out_dir.glob("*.json") if p.stem.isdigit()), reverse=True)
    lines = ["// scripts/kakomon/build.py が生成するファイルです。直接編集しないでください。"]
    lines += [f'import y{y} from "./{y}.json";' for y in years]
    lines += ["", f"const years = [{', '.join(f'y{y}' for y in years)}];", "", "export default years;"]
    (out_dir / "index.ts").write_text("\n".join(lines) + "\n")


if __name__ == "__main__":
    main()
