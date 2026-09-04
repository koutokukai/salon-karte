import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";
import { ensureSchema } from "@/lib/schema-bootstrap";

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
  const base = new PrismaClient({ adapter });

  /**
   * 最初のモデル操作の前に、空のDBならスキーマを作る。
   * 呼び出し側に手順を増やさないよう、入口を1本に絞ってここで面倒を見る。
   * 生SQL（$queryRawUnsafe 等）は $allModels の対象外なので再帰しない。
   */
  return base.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          await ensureSchema(base);
          return query(args);
        },
      },
    },
  }) as unknown as PrismaClient;
}

/**
 * 開発中は HMR で作り直されるのを避けるため globalThis に載せる。
 * 本番は同じ関数インスタンスの中で1つを使い回す（毎回 new すると接続が積み上がる）。
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
let cached: PrismaClient | undefined;

function client(): PrismaClient {
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma ??= createPrisma();
    return globalForPrisma.prisma;
  }
  cached ??= createPrisma();
  return cached;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const instance = client();
    // receiver は渡さない。渡すとゲッター内の this がこの Proxy になり、
    // $extends が付けた振る舞い（スキーマの自動作成）が外れる。
    const value = Reflect.get(instance, property, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
