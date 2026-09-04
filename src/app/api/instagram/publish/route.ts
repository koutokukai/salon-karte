import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { diagPage } from "@/lib/diag-page";
import { imageIsReachable, publishImage, publishingQuota } from "@/lib/instagram";
import { QUEUE, imageUrl } from "@/lib/social-queue";

const TICKET_KEY = "publish_ticket";

/**
 * キューの先頭を1件だけ手で投稿する。
 * 接続直後の疎通確認用。**使い捨てチケットが要る**（/api/instagram/callback が発行し、15分で失効）。
 * cron の CRON_SECRET を知らなくても、接続した本人だけがその場で1回試せる。
 */
export async function GET(request: NextRequest) {
  const ticket = new URL(request.url).searchParams.get("ticket");
  if (!ticket) return diagPage("投稿できません", [["原因", "チケットがありません"]]);

  const saved = await prisma.appSetting.findUnique({ where: { key: TICKET_KEY } });
  const [value, expiresAt] = (saved?.value ?? ":0").split(":");

  if (value !== ticket || Number(expiresAt) < Date.now()) {
    return diagPage("投稿できません", [
      ["原因", "チケットが一致しないか、期限切れです"],
      ["やり直す", "/api/instagram/connect から接続し直してください"],
    ]);
  }

  // 使い捨て。押し直しでの二重投稿を防ぐ。
  await prisma.appSetting.delete({ where: { key: TICKET_KEY } }).catch(() => {});

  const posted = await prisma.socialPost.findMany({
    where: { status: "posted" },
    select: { slug: true },
  });
  const done = new Set(posted.map((row) => row.slug));
  const next = QUEUE.find((post) => !done.has(post.slug));
  if (!next) return diagPage("投稿するものがありません", [["キュー", "投稿しきっています"]]);

  const url = imageUrl(next.image);
  if (!(await imageIsReachable(url))) {
    return diagPage("画像が取得できません", [
      ["slug", next.slug],
      ["画像URL", url],
      ["対応", "public/social/ に画像があるか、SITE_URL が正しいかを確認"],
    ]);
  }

  try {
    const quota = await publishingQuota();
    if (quota.used >= quota.total) {
      return diagPage("投稿枠がありません", [["24時間の使用状況", `${quota.used} / ${quota.total}`]]);
    }

    const { mediaId, permalink } = await publishImage(url, next.caption);

    await prisma.socialPost.upsert({
      where: { slug: next.slug },
      update: { status: "posted", mediaId, permalink, postedAt: new Date(), error: null },
      create: { slug: next.slug, status: "posted", mediaId, permalink, postedAt: new Date() },
    });

    return diagPage("投稿しました", [
      ["slug", next.slug],
      ["投稿URL", permalink ?? "（取得できませんでした）"],
      ["残り", `${QUEUE.length - done.size - 1} 件`],
      ["以降", "毎日 10:00（JST）に自動で1件ずつ投稿されます"],
    ]);
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "投稿に失敗しました";

    await prisma.socialPost.upsert({
      where: { slug: next.slug },
      update: { status: "failed", error: message },
      create: { slug: next.slug, status: "failed", error: message },
    });

    return diagPage("投稿に失敗しました", [
      ["slug", next.slug],
      ["エラー", message],
    ]);
  }
}
