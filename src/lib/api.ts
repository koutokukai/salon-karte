import "server-only";
import { NextResponse } from "next/server";
import { getTenant, type SessionTenant } from "@/lib/auth";

/**
 * /api/v1 — 将来のネイティブアプリ（iOS/Android）用の入口。
 * Web UI は Server Actions を使うが、ロジックは src/lib/services/* に集約しており
 * ここは同じ関数を薄く HTTP に露出させるだけにしている。
 * 認証は現状セッションCookie。ネイティブ対応時は Bearer トークンをここに足すだけで済む。
 */
export async function withTenant(
  handler: (tenant: SessionTenant) => Promise<NextResponse>,
): Promise<NextResponse> {
  const tenant = await getTenant();
  if (!tenant) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  try {
    return await handler(tenant);
  } catch (error) {
    const message = error instanceof Error ? error.message : "処理に失敗しました";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
