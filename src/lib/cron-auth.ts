import "server-only";
import type { NextRequest } from "next/server";

/**
 * Vercel Cron は Authorization: Bearer $CRON_SECRET を付けて呼び出す。
 * CRON_SECRET が未設定なら誰でも叩けてしまうので、その場合は必ず拒否する。
 */
export function cronAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}
