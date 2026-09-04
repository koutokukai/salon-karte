import "server-only";
import { env } from "@/lib/env";

/**
 * Instagram ログイン方式の OAuth（アプリ側で完結させるための実装）。
 *
 * なぜ要るか：
 *   Vercel の環境変数は保存後に読み出せない。取り違えたトークンが入っていても
 *   外からは確認できず、cron が失敗しても原因が分からない状態になる。
 *   ここで「Instagramで認可 → アプリがトークンを受け取り app_settings に保存」まで
 *   通してしまえば、トークンを人が貼る工程そのものが消える。
 *   accessToken() は保存済みの値を環境変数より優先するので、これで上書きできる。
 */

/** Instagram アプリID（公開値。秘密ではない）。 */
export const IG_APP_ID = env("IG_APP_ID") ?? "1101996452418775";

/** 接続を許可する Instagram アカウント。他人が認可しても保存しない。 */
export const ALLOWED_USERNAME = env("IG_ALLOWED_USERNAME") ?? "karte_lab";

export const SCOPES = ["instagram_business_basic", "instagram_business_content_publish"] as const;

export function redirectUri(origin: string) {
  return `${origin.replace(/\/$/, "")}/api/instagram/callback`;
}

export function authorizeUrl(origin: string, state: string) {
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", IG_APP_ID);
  url.searchParams.set("redirect_uri", redirectUri(origin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES.join(","));
  url.searchParams.set("state", state);
  return url.toString();
}

async function readJson(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { raw: text } as Record<string, unknown>;
  }
}

function errorMessage(json: Record<string, unknown>, status: number) {
  const nested = (json as { error?: { message?: string } }).error?.message;
  const flat = typeof json.error_message === "string" ? json.error_message : undefined;
  return nested ?? flat ?? (typeof json.raw === "string" ? json.raw : null) ?? `HTTP ${status}`;
}

/** 認可コード → 短命トークン。 */
export async function exchangeCode(code: string, origin: string) {
  const secret = env("IG_APP_SECRET");
  if (!secret) throw new Error("IG_APP_SECRET が未設定です（Vercel の環境変数を確認）");

  const response = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: IG_APP_ID,
      client_secret: secret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri(origin),
      code,
    }),
  });

  const json = await readJson(response);
  if (!response.ok) throw new Error(`トークン取得に失敗：${errorMessage(json, response.status)}`);

  const token = typeof json.access_token === "string" ? json.access_token : null;
  if (!token) throw new Error("access_token が返りませんでした");
  return token;
}

/**
 * 短命トークン → 60日トークン。
 * 既に長期のトークンを渡すと 452 が返るため、失敗しても元のトークンで続行する。
 */
export async function toLongLived(short: string) {
  const secret = env("IG_APP_SECRET");
  if (!secret) return { token: short, expiresInDays: 0, exchanged: false };

  const url = new URL("https://graph.instagram.com/access_token");
  url.searchParams.set("grant_type", "ig_exchange_token");
  url.searchParams.set("client_secret", secret);
  url.searchParams.set("access_token", short);

  const response = await fetch(url);
  const json = await readJson(response);
  if (!response.ok) return { token: short, expiresInDays: 0, exchanged: false };

  const token = typeof json.access_token === "string" ? json.access_token : short;
  const expiresIn = Number(json.expires_in ?? 0);
  return { token, expiresInDays: Math.round(expiresIn / 86400), exchanged: token !== short };
}

/** トークンの持ち主を確かめる。ここが通れば疎通は取れている。 */
export async function whoAmI(token: string) {
  const url = new URL("https://graph.instagram.com/v23.0/me");
  url.searchParams.set("fields", "user_id,username,account_type");
  url.searchParams.set("access_token", token);

  const response = await fetch(url);
  const json = await readJson(response);
  if (!response.ok) throw new Error(`アカウント確認に失敗：${errorMessage(json, response.status)}`);

  return {
    userId: String(json.user_id ?? json.id ?? ""),
    username: String(json.username ?? ""),
    accountType: String(json.account_type ?? ""),
  };
}
