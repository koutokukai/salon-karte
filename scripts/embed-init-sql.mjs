import { readFileSync, writeFileSync } from "node:fs";

/**
 * prisma/init.sql を TypeScript の文字列として埋め込む。
 * Vercel の関数バンドルに .sql が同梱される保証がないため、コードとして持たせる。
 * 使い方: npm run gen:init-sql（schema.prisma を変えたら実行する）
 */
const sql = readFileSync("prisma/init.sql", "utf8").trimEnd();

if (sql.includes("`") || sql.includes("${")) {
  throw new Error("テンプレートリテラルに入れられない文字が SQL に含まれています");
}

writeFileSync(
  "src/lib/init-sql.ts",
  `import "server-only";

/**
 * \`prisma/schema.prisma\` から生成した初期スキーマ。
 * 更新するには \`npm run gen:init-sql\` を実行する。
 *
 * ⚠ ファイルとして読まずに文字列で持っているのは、Vercel の関数バンドルに
 *   .sql が同梱される保証がないため。ここに埋めておけば必ず一緒に配られる。
 */
export const INIT_SQL = \`${sql}\`;
`,
);

console.log(`src/lib/init-sql.ts を更新しました（${sql.length} 文字）`);
