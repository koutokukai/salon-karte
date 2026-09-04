import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 では接続URLを schema ではなくここで指定する。
 * ローカルは SQLite ファイル、本番は Turso（libSQL）を同じアダプタで扱う。
 */
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  // migrate / db push 系コマンドが使う接続先
  datasource: {
    url: process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  },
  migrations: {
    seed: "node --experimental-transform-types prisma/seed.ts",
  },
});
