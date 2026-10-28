import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const layer = (patterns, message) => ({
  "no-restricted-imports": ["error", { patterns: [{ group: patterns, message }] }],
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/domain/**"],
    rules: layer(
      ["@/usecases/*", "@/presentation/*", "@/infrastructure/*", "@/app/*", "react", "next", "next/*"],
      "domain は他の層やフレームワークを読み込めません",
    ),
  },
  {
    files: ["src/usecases/**"],
    rules: layer(
      ["@/presentation/*", "@/infrastructure/*", "@/app/*", "@/domain/entities/*", "react", "next", "next/*"],
      "usecases は domain の interface・値オブジェクト・共有の型だけを読み込めます",
    ),
  },
  {
    files: ["src/presentation/**"],
    rules: layer(["@/infrastructure/*", "@/app/*", "react", "next", "next/*"], "presentation はフレームワークやデータ実装を読み込めません"),
  },
  {
    files: ["src/infrastructure/**"],
    rules: layer(["@/app/*"], "infrastructure は画面を読み込めません"),
  },
  {
    files: ["src/app/_components/**", "src/app/_hooks/**"],
    rules: layer(
      ["@/infrastructure/container", "@/infrastructure/queries/*", "@/infrastructure/repositories/*", "@/infrastructure/database/*", "@/infrastructure/data/*"],
      "画面部品からはブラウザ用の結線（browser-container）だけを使えます",
    ),
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
