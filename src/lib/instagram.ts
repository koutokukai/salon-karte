import "server-only";
import { prisma } from "@/lib/db";

/**
 * Instagram Content Publishing API。
 *
 * 投稿は「コンテナを作る → 準備完了を待つ → 公開する」の3段階。
 * 1回のAPI呼び出しでは投稿できない。
 *
 * 必要なもの:
 *   IG_USER_ID       … Instagram プロフェッショナルアカウントのID
 *   IG_ACCESS_TOKEN  … 長期アクセストークン（60日で失効。cron で自動更新する）
 *   スコープ          … instagram_business_basic / instagram_business_content_publish
 *
 * 制限: API経由の投稿は 24時間あたり50件まで。
 *
 * ⚠ DM送信はこのAPIではできない。Messaging API は相手からのメッセージ後
 *   一定時間内の返信しか許可しておらず、こちらから送る営業DMは仕様上不可能。
 *   モニター募集のDMは人が送る前提のまま。
 */

/**
 * 接続先。2通りの取り方に対応する。
 *   A) Instagram ログイン       … graph.instagram.com ／ 長期トークン60日（月次で自動更新）
 *   B) Facebookページ経由        … graph.facebook.com  ／ システムユーザーなら無期限
 * B を使う場合は IG_API_BASE に https://graph.facebook.com/v21.0 を入れる。
 */
const BASE = process.env.IG_API_BASE ?? "https://graph.instagram.com";
const TOKEN_KEY = "instagram_access_token";

/** 無期限トークン（システムユーザー等）を使っている場合は更新処理を行わない。 */
export const tokenIsPermanent = () => process.env.IG_TOKEN_PERMANENT === "true";

type PublishResult = { mediaId: string; permalink: string | null };

/** 保存済みトークンを優先し、なければ環境変数を使う（初回は env から入る）。 */
async function accessToken(): Promise<string> {
  const saved = await prisma.appSetting.findUnique({ where: { key: TOKEN_KEY } });
  const token = saved?.value ?? process.env.IG_ACCESS_TOKEN;
  if (!token) throw new Error("IG_ACCESS_TOKEN が未設定です");
  return token;
}

function userId(): string {
  const id = process.env.IG_USER_ID;
  if (!id) throw new Error("IG_USER_ID が未設定です");
  return id;
}

function call(path: string, params: Record<string, string>, method: "GET" | "POST" = "GET") {
  return callAt(new URL(`${BASE}${path}`), params, method);
}

async function callAt(url: URL, params: Record<string, string>, method: "GET" | "POST" = "GET") {
  const init: RequestInit = { method };

  if (method === "GET") {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  } else {
    init.body = new URLSearchParams(params);
  }

  const response = await fetch(url, init);
  const json: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (json as { error?: { message?: string } })?.error?.message ?? `HTTP ${response.status}`;
    throw new Error(`Instagram API: ${message}`);
  }
  return json as Record<string, unknown>;
}

/** 画像URLが実際に取得できるか先に確かめる。404の画像を渡すとAPI側で失敗する。 */
export async function imageIsReachable(imageUrl: string) {
  try {
    const response = await fetch(imageUrl, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

/** 24時間あたりの残り投稿枠。 */
export async function publishingQuota() {
  const token = await accessToken();
  const json = await call(`/${userId()}/content_publishing_limit`, {
    fields: "config,quota_usage",
    access_token: token,
  });
  const row = (json.data as { quota_usage?: number; config?: { quota_total?: number } }[])?.[0];
  return { used: row?.quota_usage ?? 0, total: row?.config?.quota_total ?? 50 };
}

/**
 * 画像を1件投稿する。
 * imageUrl は Instagram 側から取得できる公開URLである必要がある（JPEG推奨）。
 */
export async function publishImage(imageUrl: string, caption: string): Promise<PublishResult> {
  const token = await accessToken();
  const id = userId();

  // 1. コンテナ作成
  const container = await call(
    `/${id}/media`,
    { image_url: imageUrl, caption, access_token: token },
    "POST",
  );
  const creationId = String(container.id ?? "");
  if (!creationId) throw new Error("コンテナIDが返りませんでした");

  // 2. 準備完了を待つ（FINISHED になるまで。通常は数秒）
  await waitUntilReady(creationId, token);

  // 3. 公開
  const published = await call(
    `/${id}/media_publish`,
    { creation_id: creationId, access_token: token },
    "POST",
  );
  const mediaId = String(published.id ?? "");
  if (!mediaId) throw new Error("メディアIDが返りませんでした");

  // 4. パーマリンクを取得（失敗しても投稿自体は成功しているので握りつぶす）
  let permalink: string | null = null;
  try {
    const detail = await call(`/${mediaId}`, { fields: "permalink", access_token: token });
    permalink = typeof detail.permalink === "string" ? detail.permalink : null;
  } catch {
    permalink = null;
  }

  return { mediaId, permalink };
}

async function waitUntilReady(creationId: string, token: string, attempts = 12) {
  for (let i = 0; i < attempts; i++) {
    const status = await call(`/${creationId}`, {
      fields: "status_code,status",
      access_token: token,
    });
    const code = String(status.status_code ?? "");

    if (code === "FINISHED") return;
    if (code === "ERROR" || code === "EXPIRED") {
      throw new Error(`コンテナの作成に失敗しました（${code}: ${String(status.status ?? "")}）`);
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error("コンテナが準備完了になりませんでした");
}

/**
 * 短命トークン（1時間）を60日の長期トークンに交換して保存する。
 * 初回に1度だけ実行する。以降は refreshAccessToken() が延長していく。
 */
export async function exchangeForLongLivedToken() {
  const short = process.env.IG_ACCESS_TOKEN;
  const secret = process.env.IG_APP_SECRET;
  if (!short) throw new Error("IG_ACCESS_TOKEN（短命トークン）が未設定です");
  if (!secret) throw new Error("IG_APP_SECRET が未設定です");

  const json = await callAt(new URL("https://graph.instagram.com/access_token"), {
    grant_type: "ig_exchange_token",
    client_secret: secret,
    access_token: short,
  });

  const long = typeof json.access_token === "string" ? json.access_token : null;
  if (!long) throw new Error("交換後のトークンが返りませんでした");

  await prisma.appSetting.upsert({
    where: { key: TOKEN_KEY },
    update: { value: long },
    create: { key: TOKEN_KEY, value: long },
  });

  return { expiresIn: Number(json.expires_in ?? 0) };
}

/**
 * 長期トークンを更新して保存する。
 * 発行から24時間経過後であればいつでも更新でき、更新するとそこから60日延びる。
 * 60日放置すると失効するので、月1回の cron で叩く。
 */
export async function refreshAccessToken() {
  if (tokenIsPermanent()) {
    throw new Error("無期限トークンのため更新は不要です");
  }
  const token = await accessToken();
  // 更新は Instagram ログインのトークンだけが対象。ホストは固定する。
  const url = new URL("https://graph.instagram.com/refresh_access_token");
  const json = await callAt(url, {
    grant_type: "ig_refresh_token",
    access_token: token,
  });

  const next = typeof json.access_token === "string" ? json.access_token : null;
  if (!next) throw new Error("更新後のトークンが返りませんでした");

  await prisma.appSetting.upsert({
    where: { key: TOKEN_KEY },
    update: { value: next },
    create: { key: TOKEN_KEY, value: next },
  });

  return { expiresIn: Number(json.expires_in ?? 0) };
}
