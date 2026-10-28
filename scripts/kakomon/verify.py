#!/usr/bin/env python3
"""生成済みの data/kakomon/*.json を、build.py とは別の方法で原本PDFから読み直して照合する。"""
from __future__ import annotations

import argparse
import json
import re
from collections import defaultdict
from pathlib import Path

import pymupdf

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
LABELS = "アイウエオ"
FULLWIDTH = str.maketrans("０１２３４５６７８９，．", "0123456789、。")

SUBJECT_KEYWORDS = {
    "kenpo": r"憲法|国会|内閣|天皇|人権|人格権|自由|司法権|違憲|参政権|選挙|裁判官",
    "minpo": r"債権|債務|所有権|相続|遺言|契約|代理|占有|抵当権|婚姻|親権|時効|贈与|売買|賃貸借|物権|後見|保証|不法行為|意思表示|養子|嫡出|相隣|失踪|不在者|扶養|委任|土地",
    "keiho": r"罪|刑|未遂|共犯|正当防衛|故意|処罰|因果関係",
    "shoho": r"会社|株|取締役|社債|商人|商行為|組合|発起人|監査|新株予約権|会計参与|会計監査人|吸収|合併|持分",
    "minso": r"訴え|訴訟|判決|口頭弁論|証拠|控訴|上告|当事者|裁判所|期日|和解|管轄|訴状",
    "hozen": r"保全|仮差押え|仮処分",
    "shikko": r"執行|差押え|競売|債務名義|配当|財産開示|強制",
    "shoshi": r"司法書士",
    "kyotaku": r"供託",
    "fudosan": r"登記",
    "shogyo": r"登記",
}
COMPANY = r"会社|株|取締役|法人|商号|支配人|社員|清算人|監査役|新株予約権|代表理事|理事|商業登記"


def normalize(s: str) -> str:
    s = s.translate(FULLWIDTH)
    return re.sub(r"[\s\x00-\x1f]+", "", s)


def answers_by_geometry(path: Path) -> dict[str, dict[int, int | None]]:
    page = pymupdf.open(path)[0]
    lines = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            text = normalize("".join(span["text"] for span in line["spans"]))
            if text:
                lines.append((line["bbox"][0], line["bbox"][1], text))
    heads = {t: x for x, _, t in lines if t in ("午前の部", "午後の部")}
    if len(heads) != 2:
        raise ValueError("午前・午後の見出しが見つかりません")
    middle = (heads["午前の部"] + heads["午後の部"]) / 2 + 20
    rows: dict[tuple[str, int], list[tuple[float, str]]] = defaultdict(list)
    for x, y, text in lines:
        rows[("am" if x < middle else "pm", round(y / 4))].append((x, text))
    result: dict[str, dict[int, int | None]] = {"am": {}, "pm": {}}
    for (session, _), parts in rows.items():
        joined = "".join(text for _, text in sorted(parts))
        if m := re.fullmatch(r"第(\d+)問([1-5]|[-－―])", joined):
            result[session][int(m.group(1))] = int(m.group(2)) if m.group(2).isdigit() else None
    return result


def question_texts(path: Path) -> dict[int, str]:
    text = "\n".join(page.get_text() for page in pymupdf.open(path))
    text = text.translate(FULLWIDTH)
    heads = list(re.finditer(r"(?m)^第\s*(\d+)\s*問(?!\s*から)", text))
    out: dict[int, str] = {}
    for m, nxt in zip(heads, heads[1:] + [None]):
        number = int(m.group(1))
        if number not in out and number <= 35:
            out[number] = text[m.start() : nxt.start() if nxt else len(text)]
    return out


def raw_choices(raw: str) -> list[list[str]]:
    last = list(re.finditer(r"(?m)^(?:(?:学生|補助者)：)?[　 ]*オ[\x07　 ]", raw))
    tail = raw[last[-1].end() :] if last else raw
    found = re.findall(r"(?<![\d])([1-5])[\s　]*([アイウエオ]{2,3})(?=[\s　]|$)", tail)
    return [list(letters) for _, letters in sorted(found)]


def raw_statement_heads(raw: str, labels: str) -> dict[str, str]:
    heads = {}
    for label in labels:
        pattern = rf"(?m)^(?:(?:学生|補助者)：)?[　 ]*{label}[\x07　 ]+(.+)$"
        m = re.search(pattern, raw)
        if m:
            heads[label] = normalize(m.group(1))[:12]
    return heads


def raw_polarity(raw: str, kind: str) -> str | None:
    stem = normalize(raw.split("どれか。")[0])
    target = "ものの組合せ" if kind == "combo" else "ものは、どれか"
    if "正しい" + target in stem:
        return "correct"
    if "誤っている" + target in stem:
        return "incorrect"
    if target in stem or kind == "single":
        return "match"
    return None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf-dir", type=Path, default=ROOT / ".cache" / "kakomon")
    parser.add_argument("--data-dir", type=Path, default=ROOT / "src" / "infrastructure" / "data" / "kakomon")
    args = parser.parse_args()

    overrides = json.loads((HERE / "overrides.json").read_text())
    problems: list[str] = []
    stats = defaultdict(int)

    for data_file in sorted(args.data_dir.glob("*.json")):
        data = json.loads(data_file.read_text())
        year = data["year"]
        answer_override = overrides["answers"].get(str(year))
        geometry = None if answer_override else answers_by_geometry(args.pdf_dir / f"{year}_answers.pdf")
        texts = {s: question_texts(args.pdf_dir / f"{year}_{s}.pdf") for s in ("am", "pm")}
        notes = {s: normalize("".join(texts[s].values())) for s in ("am", "pm")}

        for q in data["questions"]:
            qid, session, number = q["id"], q["session"], q["number"]
            raw = texts[session].get(number, "")
            body = normalize(raw)

            expected = answer_override[session][number - 1] if answer_override else geometry[session].get(number)
            stats["answers"] += 1
            if q["answer"] != expected:
                problems.append(f"{qid}: 正解番号 データ={q['answer']} 原本={expected}")

            keywords = SUBJECT_KEYWORDS[q["subject"]]
            stats["subjects"] += 1
            if not re.search(keywords, body):
                problems.append(f"{qid}: 科目 {q['subject']} のキーワードが問題文にありません")
            if q["subject"] == "fudosan" and re.search(r"(?:" + COMPANY + r").*登記", normalize(q.get("stem", ""))):
                problems.append(f"{qid}: 不動産登記法に会社・法人の登記の柱書があります")
            if q["subject"] == "shogyo" and not re.search(COMPANY, body):
                problems.append(f"{qid}: 商業登記法に会社・法人の語句がありません")

            if not q["supported"]:
                continue
            kind = q["kind"]
            labels = LABELS if kind == "combo" else "12345"
            stats["questions"] += 1

            if kind == "combo":
                choices = raw_choices(raw)
                if choices != q["choices"]:
                    problems.append(f"{qid}: 選択肢 データ={q['choices']} 原本={choices}")

            if not q.get("columns"):
                heads = raw_statement_heads(raw, labels)
                for s in q["statements"]:
                    head = heads.get(s["label"])
                    stats["statements"] += 1
                    if head is None:
                        stats["statements_unchecked"] += 1
                    elif not normalize(s["text"]).startswith(head[:8]):
                        problems.append(f"{qid} {s['label']}: 肢の書き出し データ={normalize(s['text'])[:12]} 原本={head}")

            polarity = raw_polarity(raw, kind)
            if polarity != q["polarity"] and not (kind == "single" and q["polarity"] in ("correct", "incorrect")):
                problems.append(f"{qid}: 正誤の向き データ={q['polarity']} 原本={polarity}")

            truths = overrides["questions"].get(qid, {}).get("truths")
            if truths is None:
                selected = set(q["choices"][q["answer"] - 1])
                truths = [(s["label"] in selected) != (q["polarity"] == "incorrect") for s in q["statements"]]
                expected_true = len(selected) if q["polarity"] != "incorrect" else 5 - len(selected)
                if sum(truths) != expected_true:
                    problems.append(f"{qid}: ○の数が想定と異なります")
            for s, truth in zip(q["statements"], truths):
                stats["truths"] += 1
                if s["truth"] != truth:
                    problems.append(f"{qid} {s['label']}: ○× データ={s['truth']} 再計算={truth}")

        for session, ranges in (("am", [(4, 23, "商法の適用は考慮しない")]), ("pm", [])):
            for lo, hi, phrase in ranges:
                marker = f"第{lo}問から第{hi}問までの試験問題については、{phrase}"
                if phrase in notes[session] and marker not in notes[session]:
                    problems.append(f"{year} {session}: 注意書きの問題番号の範囲が想定と異なります")

    print("照合件数:", dict(stats))
    print(f"不一致: {len(problems)} 件")
    for p in problems:
        print("  -", p)


if __name__ == "__main__":
    main()
