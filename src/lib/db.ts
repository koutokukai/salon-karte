import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

/**
 * Prisma クライアント。
 *
 * ⚠ 接続はモジュール読み込み時ではなく、最初のクエリまで遅らせている。
 *   Next.js のビルドはルートを import して静的解析するため、ここで例外を投げると
 *   環境変数が未設定の状態（＝Vercel に取り込んだ直後）でビルドごと失敗する。
 *   LP など DB を使わないページまで巻き添えにしないための遅延生成。
 */
function createPrisma(): PrismaClient {
  const url = env("TURSO_DATABASE_URL") ?? env("DATABASE_URL");
  if (!url) throw new Error("DATABASE_URL（または TURSO_DATABASE_URL）が未設定です");

  const adapter = new PrismaLibSql({
    url,
    authToken: env("TURSO_AUTH_TOKEN"),
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function client(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const instance = createPrisma();
    if (process.env.NODE_ENV === "production") return instance;
    globalForPrisma.prisma = instance;
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const value = Reflect.get(client(), property, receiver);
    return typeof value === "function" ? value.bind(client()) : value;
  },
});
