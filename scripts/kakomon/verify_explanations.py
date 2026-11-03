#!/usr/bin/env python3
"""解説データ（src/infrastructure/data/explanations/*.json）を e-Gov 法令データと照合する。

各年度の試験は、その年の4月1日時点の法令で出題されるので、条文もその時点のものを取得して確認する。
「現行民法第…」と書いた引用は現行の条文で確認する。
確認できるのは肢IDと、引用した条・項・号が実在することまで。内容が合っているかは --show で本文を表示して人が確かめる。
--lookup は解説を書くときに条文を引くためのもので、試験時点の本文と、現在までに変わっていれば現行の本文を表示する。
"""
from __future__ import annotations

import argparse
import json
import os
import re
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "src" / "infrastructure" / "data"
CACHE_DIR = ROOT / ".cache" / "kakomon" / "laws"
YEARS = range(2020, 2027)

LAWS = {
    "憲法": "321CONSTITUTION",
    "民法": "129AC0000000089",
    "刑法": "140AC0000000045",
    "商法": "132AC0000000048",
    "会社法": "417AC0000000086",
    "会社法施行規則": "418M60000010012",
    "会社計算規則": "418M60000010013",
    "民事訴訟法": "408AC0000000109",
    "民事保全法": "401AC0000000091",
    "民事執行法": "354AC0000000004",
    "司法書士法": "325AC1000000197",
    "司法書士法施行規則": "353M50000010055",
    "供託法": "132AC0000000015",
    "供託規則": "334M50000010002",
    "不動産登記法": "416AC0000000123",
    "不動産登記令": "416CO0000000379",
    "不動産登記規則": "417M60000010018",
    "商業登記法": "338AC0000000125",
    "商業登記規則": "339M50000010023",
    "登録免許税法": "342AC0000000035",
    "租税特別措置法": "332AC0000000026",
    "建物の区分所有等に関する法律": "337AC0000000069",
    "借地借家法": "403AC0000000090",
    "農地法": "327AC0000000229",
    "信託法": "418AC0000000108",
    "一般社団法人及び一般財団法人に関する法律": "418AC0000000048",
    "仮登記担保契約に関する法律": "353AC0000000078",
    "家事事件手続法": "423AC0000000052",
    "人事訴訟法": "415AC0000000109",
    "破産法": "416AC0000000075",
    "動産及び債権の譲渡の対抗要件に関する民法の特例等に関する法律": "410AC0000000104",
    "会社法の施行に伴う関係法律の整備等に関する法律": "417AC0000000087",
    "電子署名及び認証業務に関する法律": "412AC0000000102",
    "民事調停法": "326AC1000000222",
    "利息制限法": "329AC0000000100",
    "民事訴訟費用等に関する法律": "346AC0000000040",
    "相続等により取得した土地所有権の国庫への帰属に関する法律": "503AC0000000025",
    "有限責任事業組合契約に関する法律": "417AC0000000040",
    "行政不服審査法": "426AC0000000068",
    "宅地建物取引業法": "327AC1000000176",
    "工場抵当法": "138AC0000000054",
    "登録免許税法施行規則": "342M50000040037",
    "国家賠償法": "322AC0000000125",
    "裁判所法": "322AC0000000059",
}
PREFETCH = list(LAWS)[:20]

CITATION = re.compile(
    "(" + "|".join(sorted(LAWS, key=len, reverse=True)) + r")第(\d+)条((?:の\d+)*)(?:第(\d+)項)?(?:第(\d+)号((?:の\d+)*))?(?:・第(\d+)項(?:第(\d+)号((?:の\d+)*))?)?"
)


def load_law(name: str, asof: str | None) -> dict | None:
    path = CACHE_DIR / f"{LAWS[name]}_{asof or 'latest'}.json"
    if not path.exists():
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        query = f"asof={asof}&" if asof else ""
        url = f"https://laws.e-gov.go.jp/api/2/law_data/{LAWS[name]}?{query}law_full_text_format=json&response_format=json"
        body = None
        for attempt in range(4):
            try:
                with urllib.request.urlopen(url, timeout=120) as res:
                    body = res.read()
                break
            except urllib.error.HTTPError as error:
                if error.code == 404:
                    return None
                time.sleep(2 * (attempt + 1))
            except urllib.error.URLError:
                time.sleep(2 * (attempt + 1))
        if body is None:
            raise RuntimeError(f"法令データを取得できません: {name} {asof}")
        temp = path.with_suffix(f".{os.getpid()}.tmp")
        temp.write_bytes(body)
        os.replace(temp, path)
    return json.loads(path.read_text())["law_full_text"]


def articles_of(node, found: dict | None = None) -> dict:
    found = {} if found is None else found
    if isinstance(node, dict):
        if node.get("tag") == "Article" and "Num" in node.get("attr", {}):
            found.setdefault(node["attr"]["Num"], node)
        for child_node in node.get("children", []):
            articles_of(child_node, found)
    return found


_articles: dict[tuple[str, str | None], dict] = {}


def articles(name: str, asof: str | None) -> dict:
    key = (name, asof)
    if key not in _articles:
        law = load_law(name, asof)
        _articles[key] = articles_of(law) if law else {}
    return _articles[key]


def text_of(node) -> str:
    if isinstance(node, str):
        return node
    if isinstance(node, dict):
        return "".join(text_of(child_node) for child_node in node.get("children", []))
    return ""


def child(node: dict, tag: str, num: str) -> dict | None:
    return next((c for c in node.get("children", []) if isinstance(c, dict) and c.get("tag") == tag and c.get("attr", {}).get("Num") == num), None)


def branch(suffix: str | None) -> str:
    return "".join("_" + part for part in re.findall(r"\d+", suffix or ""))


def locate(article: dict, paragraph: str | None, item: str | None) -> dict | None:
    node = article
    if paragraph:
        node = child(node, "Paragraph", paragraph)
    if node is not None and item:
        target = node if paragraph else child(node, "Paragraph", "1")
        node = child(target, "Item", item) if target else None
    return node


def resolve(match: re.Match, asof: str | None) -> tuple[dict | None, dict | None]:
    law, art, art_branch, para, item, item_branch, para2, item2, item2_branch = match.groups()
    article = articles(law, asof).get(art + branch(art_branch))
    if article is None:
        return None, None
    first = locate(article, para, item + branch(item_branch) if item else None)
    second = locate(article, para2, item2 + branch(item2_branch) if item2 else None) if para2 else None
    return first, second if para2 else first


def asof_of(item_id: str) -> str:
    return f"{item_id[:4]}-04-01"


def lookup(citations: list[str], year: int) -> None:
    asof = f"{year}-04-01"
    for citation in citations:
        match = CITATION.fullmatch(citation.strip())
        if not match:
            print(f"{citation}: 引用の形式が読み取れません（例: 民法第398条の19第1項）")
            continue
        node, _ = resolve(match, asof)
        print(f"■ {citation}（{asof}時点）: {text_of(node)[:700] if node else 'この時点の条文にありません'}")
        current, _ = resolve(match, None)
        if text_of(current) != text_of(node):
            print(f"  → 現行: {text_of(current)[:700] if current else '現行の条文にありません'}")


def check(files: list[Path], show: bool) -> None:
    questions = {
        q["id"]: q
        for path in (DATA_DIR / "kakomon").glob("*.json")
        for q in json.loads(path.read_text())["questions"]
    }
    problems: list[str] = []
    total = cited = 0
    written: set[str] = set()

    for path in files:
        for item_id, text in json.loads(path.read_text()).items():
            total += 1
            written.add(item_id)
            m = re.fullmatch(r"(.+)-([1-5])", item_id)
            question = questions.get(m.group(1)) if m else None
            if not question or not question["supported"] or int(m.group(2)) > len(question["statements"]):
                problems.append(f"{item_id}: 問題データに存在しない肢です")
                continue
            if not text.strip():
                problems.append(f"{item_id}: 解説が空です")
            for c in CITATION.finditer(text):
                cited += 1
                asof = None if text[: c.start()].endswith("現行") else asof_of(item_id)
                first, second = resolve(c, asof)
                if first is None or second is None:
                    problems.append(f"{item_id}: {c.group(0)} が{asof or '現行'}時点の条文にありません")
                elif show:
                    print(f"{item_id} {c.group(0)}: {text_of(second)[:120]}")

    sessions = {item_id.rsplit("-", 2)[0] for item_id in written}
    missing = [
        f"{q['id']}-{i + 1}"
        for q in questions.values()
        if f"{q['year']}-{q['session']}" in sessions and q["supported"]
        for i in range(len(q["statements"]))
        if f"{q['id']}-{i + 1}" not in written
    ]
    print(f"解説 {total} 件 / 条文の引用 {cited} 件 / 未作成の肢 {len(missing)} 件 / 問題 {len(problems)} 件")
    for problem in problems:
        print("  -", problem)
    if missing:
        print("  未作成:", ", ".join(missing[:60]))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--show", action="store_true", help="引用先の条文本文を表示する")
    parser.add_argument("--file", type=Path, nargs="+", help="照合するファイル（省略時は解説データ全体）")
    parser.add_argument("--year", type=int, help="--lookup で使う試験年度（西暦）")
    parser.add_argument("--lookup", nargs="+", help="条文を引く（例: 民法第398条の19第1項）")
    parser.add_argument("--prefetch", action="store_true", help="主な法令を全年度分あらかじめ取得する")
    args = parser.parse_args()

    if args.prefetch:
        for name in PREFETCH:
            for asof in [None, *(f"{year}-04-01" for year in YEARS)]:
                load_law(name, asof)
        print("取得しました")
    elif args.lookup:
        if not args.year:
            parser.error("--lookup には --year が必要です")
        lookup(args.lookup, args.year)
    else:
        check(args.file or sorted((DATA_DIR / "explanations").glob("*.json")), args.show)


if __name__ == "__main__":
    main()
