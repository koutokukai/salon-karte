import { NextResponse, type NextRequest } from "next/server";
import { cronAuthorized } from "@/lib/cron-auth";
import { exchangeForLongLivedToken } from "@/lib/instagram";

/**
 * 短命トークン（1時間）を60日トークンに交換して保存する。1回叩けば終わり。
 * 手でURLを組み立てると貼り間違いで失敗しやすいので、ここで受ける。
 *
 * 事前に Vercel の環境変数へ:
 *   IG_ACCESS_TOKEN … 生成直後の短命トークン
 *   IG_APP_SECRET   … Instagram app secret
 *   CRON_SECRET     … 認証用
 *
 * 実行:  node scripts/cron-run.mjs ../instagram/exchange --base https://本番URL
 * 成功後は交換済みトークンが app_settings に入り、以降そちらが使われる。
 */
export async function GET(request: NextRequest) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const { expiresIn } = await exchangeForLongLivedToken();
    return NextResponse.json({
      status: "exchanged",
      expiresInDays: Math.round(expiresIn / 86400),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "交換に失敗しました";
    return NextResponse.json({ status: "failed", error: message }, { status: 400 });
  }
}
