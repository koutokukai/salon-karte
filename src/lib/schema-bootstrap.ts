import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { INIT_SQL } from "@/lib/init-sql";

/**
 * 空のデータベースに一度だけスキーマを流す。
 *
 * なぜ要るか：
 *   本番DB（Turso）は Vercel 側で払い出され、接続情報は書き込み専用で取り出せない。
 *   手元から `prisma db push` を打つには、その接続トークンを人が持ち出す必要がある。
 *   持ち出さずに済ませるため、アプリ自身が初回だけ CREATE TABLE を流す。
 *
 * 安全側の作り：
 *   - 流すSQLは schema.prisma から生成した固定の文字列だけ。外から渡せない
 *   - テーブルが1つでもあれば何もしない。既存データを触る経路がない
 *   - 公開エンドポイントは作らない。DBを使う処理の内側からだけ呼ばれる
 *   - プロセス内で1回だけ走る（結果を使い回す）
 */
let bootstrapped: Promise<void> | null = null;

async function run(prisma: PrismaClient) {
  const tables = await prisma.$queryRawUnsafe<{ name: string }[]>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream%'",
  );
  if (tables.length > 0) return;

  // 生成されるSQLは各文の頭に `-- CreateTable` などの注釈が付く。
  // 文ごと捨てるのではなく、注釈行だけを落とすこと（落とし損ねると全文が消える）。
  const statements = INIT_SQL.split(";")
    .map((statement) =>
      statement
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter((statement) => statement.length > 0);

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }
}

export function ensureSchema(prisma: PrismaClient) {
  if (!bootstrapped) {
    bootstrapped = run(prisma).catch((error) => {
      // 失敗したら次の呼び出しでやり直せるようにする（起動直後の接続失敗など）
      bootstrapped = null;
      throw error;
    });
  }
  return bootstrapped;
}
