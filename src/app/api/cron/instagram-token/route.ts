import { NextResponse, type NextRequest } from "next/server";
import { cronAuthorized } from "@/lib/cron-auth";
import { refreshAccessToken, tokenIsPermanent } from "@/lib/instagram";
import { env } from "@/lib/env";

/**
 * 長期アクセストークンの更新。60日放置すると失効するため月1回叩く。
 * 更新後のトークンは app_settings に保存され、以降そちらが優先して使われる。
 */
export async function GET(request: NextRequest) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  if (!env("IG_ACCESS_TOKEN")) {
    return NextResponse.json({ status: "not_configured" });
  }

  if (tokenIsPermanent()) {
    // システムユーザー等の無期限トークン。更新するものがない。
    return NextResponse.json({ status: "permanent_token" });
  }

  try {
    const { expiresIn } = await refreshAccessToken();
    return NextResponse.json({ status: "refreshed", expiresInDays: Math.round(expiresIn / 86400) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新に失敗しました";
    return NextResponse.json({ status: "failed", error: message }, { status: 500 });
  }
}
