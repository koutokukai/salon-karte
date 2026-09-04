import "server-only";

/**
 * 環境変数を読む。**空文字は「未設定」として扱う。**
 *
 * ⚠ これが要る理由：
 *   `.env.example` は `IG_USER_ID=""` のように空で置いてあるキーを含む。
 *   これを Vercel に丸ごと取り込むと「キーは存在するが値は空文字」になる。
 *   `process.env.X ?? 既定値` は空文字を弾かないため、
 *   IG_USER_ID なら `/{空}/media` という壊れたパスに、
 *   SITE_URL なら本番URLへのフォールバックが働かないまま例外に落ちる。
 *   実際に本番で疎通しなかった原因がこれ。二度踏まないよう入口を1本にする。
 */
export function env(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}
