# 司法書士道場

司法書士試験の択一式過去問を、1肢ずつ○×で解ける学習サイトです。

- 組合せ問題（「正しいものの組合せは…」）を本試験の正解から逆算し、各肢の正誤に分解して出題
- 年度・科目・出題対象（未解答／要復習／誤答歴あり／ブックマーク）を選んでランダムまたは順番通りに出題
- 科目別・年度別の正答率、直近14日の解答数を表示
- 間違えた肢の一覧と解き直し、元の問題（全肢と正解）の確認
- 学習記録はブラウザの localStorage に保存（成績ページからファイルへの書き出し・読み込みが可能）

## 開発

```bash
npm install
npm run dev      # 開発起動
npm run build    # ビルド
npm run lint     # Lint（層をまたぐ依存の向きもここで検査）
npm test         # ユニットテスト
```

構成はクリーンアーキテクチャです（`src/domain` → `src/usecases` → `src/presentation` → `src/app`、実装は `src/infrastructure`）。層ごとの置き場所と決まりは [CLAUDE.md](CLAUDE.md) を参照してください。

## 過去問データ

`src/infrastructure/data/kakomon/*.json` と `public/kakomon/figures/` は、法務省が公表している試験問題・正解のPDFから `scripts/kakomon/` のスクリプトで生成しています。

```bash
python3 -m venv .venv
.venv/bin/pip install -r scripts/kakomon/requirements.txt
.venv/bin/python scripts/kakomon/fetch.py   # PDFを .cache/kakomon/ にダウンロード
.venv/bin/python scripts/kakomon/build.py   # src/infrastructure/data/kakomon/ を生成
.venv/bin/python scripts/kakomon/verify.py  # 生成データを原本PDFと別経路で照合
```

- 年度の追加は `scripts/kakomon/sources.json` に問題・正解PDFのURLを追記して再実行します。
- 正解PDFが画像のみの年度（令和2年度）や、出題ミスにより全員正解となった問題（令和7年度午後第33問）は `scripts/kakomon/overrides.json` で補正しています。
- 空欄補充・計算問題など、1肢ずつの○×に変換できない形式は対象外として出力し、問題一覧では「対象外」と表示します。

### 収録範囲

| 年度 | 状態 |
| --- | --- |
| 令和2〜8年度 | 収録済み（490問中486問・2,430肢） |
| 平成31年度（令和元年度） | 法務省サイトのPDFがスキャン画像のため未収録（OCRが必要） |
| 平成29・30年度 | 法務省サイトに掲載がなく未収録 |

## 出典

法務省ウェブサイト「司法書士試験」の各年度の試験問題・正解（公共データ利用規約 第1.0版）を加工して作成しています。
