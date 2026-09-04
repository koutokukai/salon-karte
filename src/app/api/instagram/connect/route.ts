import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { authorizeUrl } from "@/lib/instagram-oauth";

const STATE_COOKIE = "ig_oauth_state";

/**
 * Instagram の認可画面へ送る。ブラウザで一度開くだけでよい。
 * state はクッキーに置き、callback 側で突き合わせる（CSRF 対策）。
 */
export async function GET(request: NextRequest) {
  const state = randomBytes(16).toString("hex");
  const origin = new URL(request.url).origin;

  const response = NextResponse.redirect(authorizeUrl(origin, state));
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
