import { type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { ALLOWED_USERNAME, exchangeCode, toLongLived, whoAmI } from "@/lib/instagram-oauth";
import { QUEUE, imageUrl } from "@/lib/social-queue";
import { imageIsReachable } from "@/lib/instagram";
import { diagPage } from "@/lib/diag-page";

const STATE_COOKIE = "ig_oauth_state";
const TOKEN_KEY = "instagram_access_token";
const TICKET_KEY = "publish_ticket";
/** 手動投稿を数回に分けて出せるよう、接続から2時間は有効にする。 */
const TICKET_TTL_MS = 2 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = url.origin;

  const error = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (error) return diagPage("接続できませんでした", [["Instagram からの応答", error]]);

  const code = url.searchParams.get("code");
  if (!code) return diagPage("接続できませんでした", [["原因", "認可コードが返っていません"]]);

  const state = url.searchParams.get("state");
  const expected = request.cookies.get(STATE_COOKIE)?.value;
  if (!state || !expected || state !== expected) {
    return diagPage("接続できませんでした", [
      ["原因", "state が一致しません。/api/instagram/connect からやり直してください"],
    ]);
  }

  try {
    const short = await exchangeCode(code, origin);
    const { token, expiresInDays, exchanged } = await toLongLived(short);
    const me = await whoAmI(token);

    if (me.username.toLowerCase() !== ALLOWED_USERNAME.toLowerCase()) {
      return diagPage("このアカウントでは接続できません", [
        ["認可されたアカウント", `@${me.username}`],
        ["接続を許可しているアカウント", `@${ALLOWED_USERNAME}`],
        ["対応", "Instagram を @" + ALLOWED_USERNAME + " に切り替えてやり直してください"],
      ]);
    }

    // ここで初めて DB に書く。成功すれば本番DBが生きていることの証明にもなる。
    await prisma.appSetting.upsert({
      where: { key: TOKEN_KEY },
      update: { value: token },
      create: { key: TOKEN_KEY, value: token },
    });

    const ticket = randomBytes(16).toString("hex");
    await prisma.appSetting.upsert({
      where: { key: TICKET_KEY },
      update: { value: `${ticket}:${Date.now() + TICKET_TTL_MS}` },
      create: { key: TICKET_KEY, value: `${ticket}:${Date.now() + TICKET_TTL_MS}` },
    });

    const posted = await prisma.socialPost.findMany({
      where: { status: "posted" },
      select: { slug: true },
    });
    const done = new Set(posted.map((row) => row.slug));
    const next = QUEUE.find((post) => !done.has(post.slug));

    let imageState = "キューが空です";
    let firstImage = "—";
    if (next) {
      firstImage = imageUrl(next.image);
      imageState = (await imageIsReachable(firstImage)) ? "取得できる" : "取得できない（404）";
    }

    return diagPage(
      "Instagram に接続しました",
      [
        ["アカウント", `@${me.username}`],
        ["種別", me.accountType],
        ["トークン", exchanged ? `60日トークンに交換して保存（残り約${expiresInDays}日）` : "取得したトークンをそのまま保存"],
        ["保存先", "app_settings（環境変数より優先されます）"],
        ["データベース", "書き込みに成功"],
        ["投稿済み", `${done.size} 件`],
        ["次に投稿するもの", next ? next.slug : "なし"],
        ["画像の公開URL", firstImage],
        ["画像の状態", imageState],
      ],
      next
        ? { href: `/api/instagram/publish?ticket=${ticket}&count=3`, label: "今すぐ3件投稿する" }
        : undefined,
    );
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "不明なエラー";
    return diagPage("接続に失敗しました", [
      ["エラー", message],
      ["やり直す", `${origin}/api/instagram/connect`],
    ]);
  }
}
