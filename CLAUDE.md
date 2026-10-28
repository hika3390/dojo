@AGENTS.md

# 司法書士道場 プロジェクト規約

司法書士試験の択一式過去問を1肢ずつ○×で解く学習サイト。Next.js（App Router, TypeScript）で実装する。
**本プロジェクトはクリーンアーキテクチャを採用する。新規コードは必ず本ドキュメントのレイヤー規約に従うこと。**

> **Next.js のバージョン注意**: 本プロジェクトは Next.js 16 / React 19（Cache Components 有効）。コードを書く前に `node_modules/next/dist/docs/` の該当ガイドと `@AGENTS.md` を確認すること。

## システム上の位置づけ

- 問題データは、法務省が公表した試験問題・正解のPDFから `scripts/kakomon/`（Python）で生成した JSON（`src/infrastructure/data/kakomon/`）。サーバー側は読み取り専用。
- 学習記録（解答履歴・日別の解答数・ブックマーク）はブラウザの localStorage に保存する。ログインやサーバー側の保存はない。
- 書き込みはすべてブラウザ側（学習記録）。サーバー側の処理は問題データの読み取りだけ。

## 唯一にして最大のルール

> **依存の矢印は、外側から内側へ。内側は外側を知らない。**

- **約束（interface）は内側に置き、実装（class）は外側（infrastructure）に置く。**
- **実装クラスを `new` してよいのは結線（`infrastructure/container.ts` と `infrastructure/browser-container.ts`）だけ。** 他の層は interface を注入で受け取る。
- `domain` は `next/*`・React・他の層を **import しない**。純粋な TypeScript のみ。
- 依存の向きは `eslint.config.mjs` の `no-restricted-imports` で検査している。`npm run lint` が通らない変更はしない。

## レイヤー構成（src/ 配下）

```
src/
├── domain/                  最内層。業務ルール。外部を一切 import しない
│   ├── constants/           複数層から参照する業務定数（例: subjects.ts の科目と問題番号の範囲）
│   ├── entities/            Entity（例: learning-record.entity.ts / question.entity.ts）
│   ├── values/              Value Object（生成時に検証。例: item-id.vo.ts / question-id.vo.ts）
│   ├── errors/              ドメインエラー（例: question-errors.ts）
│   ├── shared/              共有の値型（例: subject.types.ts / learning-record.types.ts）
│   └── repositories/        リポジトリの interface（例: learning-record.repository.interface.ts）
├── usecases/                処理の手順。domain の interface・VO・共有の型・エラーだけに依存
│   ├── dto/                 書き込みの入力=xxx.dto.ts / 読み取りの出力=xxx-query.dto.ts
│   ├── queries/             読み取り専用の QueryService interface（契約のみ）
│   ├── shared/              複数の usecase が共有する処理（例: select-practice-items.ts）
│   └── xxx.use-case.ts      1機能1クラス。公開メソッドは execute(input)。直下にはこれ以外を置かない
├── presentation/            入力検証・ドメイン例外→画面向けメッセージ・表示整形
│   ├── shared/              フレームワーク非依存の純粋関数（formatters / practice-filter / error-mapping など）
│   └── controllers/         入口の窓口。検証 → 実行 → 翻訳のみ
├── infrastructure/          interface の実装と結線
│   ├── data/kakomon/        問題データ（scripts/kakomon/build.py が生成。直接編集しない）
│   ├── database/            ブラウザの保存先（learning-record-storage.ts。localStorage の読み書きと変更通知）
│   ├── repositories/        リポジトリの実装（例: learning-record.repository.ts）
│   │   └── mappers/         保存形式 ↔ Entity ↔ 画面用DTO の詰め替え
│   ├── queries/             QueryService の実装（問題データ・学習記録・演習用一覧の取得）
│   ├── container.ts         サーバー側の結線（問題データの QueryService と API の Controller）
│   └── browser-container.ts ブラウザ側の結線（学習記録のリポジトリ・ユースケース・Controller）
└── app/                     Next.js ルーティング。薄い入口（ロジックを持たせない）
    ├── **/page.tsx          Server Component。読み取りは container の QueryService を直接呼んでよい
    ├── api/**/route.ts      API。Controller に丸投げ
    ├── _components/*.tsx    React コンポーネント（UI）
    ├── _hooks/              画面から学習記録・演習用一覧を読むフック（browser-container 経由）
    └── _constants/          画面専用の定数（Tailwind のクラス文字列など）
```

依存方向: `app → presentation → usecases → domain`。`infrastructure` は内側の約束を implements するが、内側は `infrastructure` を import しない。

## 各層の責務

### domain
- Entity / Value Object / リポジトリ interface / 業務ルール。
- VO は生成時に検証し、不正な値ではインスタンス化できないようにする（存在＝妥当）。

### usecases
- 1ユースケース1クラス。依存先は domain の interface（コンストラクタで注入）。実装クラスを知らない。
- **`domain/entities/` を import しない**。触れてよいのは `repositories/`・`values/`・`errors/`・`shared/`・`constants/`。
- 入出力は `dto/` の DTO。Entity/VO を戻り値として外へ出さない。戻り値が要らない書き込みは `void`。
- 読み取りは QueryService（`queries/` に契約、`infrastructure/queries/` に実装）。

### presentation
- 入力検証、ドメイン例外→画面向けメッセージ、表示整形。
- Controller は「検証 → 実行 → 翻訳」のみ。業務ルールを持ち込まない。

### infrastructure
- リポジトリ・QueryService の実装、保存先、結線。
- 保存形式の都合（localStorage のキー名・JSON の形）はこの層より内側へ持ち出さない。詰め替えは `repositories/mappers/` に置く。

### app
- 薄い入口。`route.ts` は Controller に丸投げ、`page.tsx` は QueryService を呼んで表示部品に渡すだけ。
- 画面部品（`_components` / `_hooks`）からは `browser-container` だけを使う。サーバー用の `container` やデータ実装を直接 import しない（問題データ一式がブラウザ向けの配信物に入るため）。

## 実装ルール

- ドキュメント、コメント、画面文言は普段使う日本語で書く。
- すべての UseCase クラスには、クラス宣言の直前に概要コメントを書く。目的だけでなく、主な入力確認、処理の順番、保存先への操作、失敗した場合の扱い、返す内容を書く。処理を変えたらコメントも直す。
- import alias: `@/*` → `./src/*`。
- テストは `tests/` に層ごとに置く（`usecases/` 直下には use-case ファイル以外を置かないため）。ユースケースのテストは `tests/helpers` のメモリ上のリポジトリを注入して行う。

## ファイル命名

ケバブケース + 役割サフィックス。

| 置くもの | 名前 | 場所 |
|---|---|---|
| Entity | `xxx.entity.ts` | `src/domain/entities` |
| Value Object | `xxx.vo.ts` | `src/domain/values` |
| リポジトリ interface | `xxx.repository.interface.ts`（`IXxxRepository`） | `src/domain/repositories` |
| リポジトリ実装 | `xxx.repository.ts`（`XxxRepository implements IXxxRepository`） | `src/infrastructure/repositories` |
| 詰め替え | `xxx.mapper.ts`（`toXxxEntity` など） | `src/infrastructure/repositories/mappers` |
| ユースケース | `xxx.use-case.ts`（`XxxUseCase`） | `src/usecases` |
| 書き込みの入力 DTO | `xxx.dto.ts` | `src/usecases/dto` |
| 読み取りの出力 DTO | `xxx-query.dto.ts` | `src/usecases/dto` |
| QueryService interface | `xxx.query-service.interface.ts`（`IXxxQueryService`） | `src/usecases/queries` |
| QueryService 実装 | `xxx.query-service.ts` | `src/infrastructure/queries` |
| Controller | `xxx.controller.ts` | `src/presentation/controllers` |

## 過去問データ

- 生成: `scripts/kakomon/fetch.py` → `build.py`。照合: `verify.py`（原本PDFを別経路で読み直して突き合わせる）。
- 手作業の補正は `scripts/kakomon/overrides.json` に置き、生成物（`src/infrastructure/data/kakomon/`）は直接編集しない。

## ビルド・確認

- 開発起動: `npm run dev`
- ビルド: `npm run build`
- Lint（依存の向きの検査を含む）: `npm run lint`
- テスト: `npm test`
