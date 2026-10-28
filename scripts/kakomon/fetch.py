#!/usr/bin/env python3
"""法務省サイトから司法書士試験の問題・正解PDFをダウンロードする。"""
import json
import sys
import time
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
CACHE_DIR = HERE.parents[1] / ".cache" / "kakomon"
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"


def main() -> None:
    sources = json.loads((HERE / "sources.json").read_text())
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    for src in sources:
        for kind in ("am", "pm", "answers"):
            dest = CACHE_DIR / f"{src['year']}_{kind}.pdf"
            if dest.exists() and "--force" not in sys.argv:
                continue
            req = urllib.request.Request(src[kind], headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req) as res:
                dest.write_bytes(res.read())
            print(f"downloaded {dest.name}")
            time.sleep(1)


if __name__ == "__main__":
    main()
