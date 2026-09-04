// Cron ルートを手で叩くためのスクリプト。
//   node scripts/cron-run.mjs instagram
//   node scripts/cron-run.mjs instagram-token --base https://example.vercel.app
// CRON_SECRET は環境変数から読む（.env でも可）。
import { readFileSync } from "node:fs";

const [job = "instagram", ...rest] = process.argv.slice(2);
const baseIndex = rest.indexOf("--base");
const base = baseIndex >= 0 ? rest[baseIndex + 1] : "http://localhost:3000";

let secret = process.env.CRON_SECRET;
if (!secret) {
  try {
    secret = readFileSync(".env", "utf8").match(/^CRON_SECRET="?([^"\n]+)"?/m)?.[1];
  } catch {
    /* .env が無ければ環境変数のみ */
  }
}
if (!secret) {
  console.error("CRON_SECRET が設定されていません");
  process.exit(1);
}

const response = await fetch(`${base}/api/cron/${job}`, {
  headers: { authorization: `Bearer ${secret}` },
});
console.log(response.status, await response.text());
