import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { diagPage } from "@/lib/diag-page";
import { imageIsReachable, publishImage, publishingQuota } from "@/lib/instagram";
import { QUEUE, imageUrl } from "@/lib/social-queue";

const TICKET_KEY = "publish_ticket";

/** 1回の呼び出しで投げる上限。関数の実行時間に収まる数にしてある（1件あたり最大30秒前後）。 */
const MAX_PER_CALL = 3;

export const maxDuration = 300;

/**
 * キューの先頭から手で投稿する。プロフィールを埋めるための初速用。
 *
 * **チケットが要る**（`/api/instagram/callback` が発行し、15分で失効）。
 * cron の CRON_SECRET を知らなくても、接続した本人だけがその場で投稿できる。
 * 期限内は押し直せる。二重投稿は `social_posts.slug` の一意制約で防いでいる。
 *
 * `?count=3` で最大3件まで続けて投稿する。
 * 一気に9件出さないのは、開設直後のアカウントが短時間に大量投稿すると
 * 業者と見なされやすいため。数回に分けて出す。
 */
export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const ticket = params.get("ticket");
  if (!ticket) return diagPage("投稿できません", [["原因", "チケットがありません"]]);

  const requested = Number(params.get("count") ?? "1");
  const count = Math.min(Math.max(Number.isFinite(requested) ? requested : 1, 1), MAX_PER_CALL);

  const saved = await prisma.appSetting.findUnique({ where: { key: TICKET_KEY } });
  const [value, expiresAt] = (saved?.value ?? ":0").split(":");

  if (value !== ticket || Number(expiresAt) < Date.now()) {
    return diagPage("投稿できません", [
      ["原因", "チケットが一致しないか、期限切れです"],
      ["やり直す", "/api/instagram/connect から接続し直してください"],
    ]);
  }

  const posted = await prisma.socialPost.findMany({
    where: { status: "posted" },
    select: { slug: true },
  });
  const done = new Set(posted.map((row) => row.slug));
  const pending = QUEUE.filter((post) => !done.has(post.slug));

  if (pending.length === 0) {
    return diagPage("投稿するものがありません", [
      ["キュー", `${QUEUE.length} 件すべて投稿済み`],
      ["次にやること", "content/instagram-queue.json に足して、画像を public/social/ に置く"],
    ]);
  }

  const results: [string, string][] = [];
  let published = 0;

  for (const next of pending.slice(0, count)) {
    const url = imageUrl(next.image);

    if (!(await imageIsReachable(url))) {
      results.push([next.slug, `画像が取得できない → ${url}`]);
      break; // キューの順番を崩さないよう、ここで止める
    }

    try {
      const quota = await publishingQuota();
      if (quota.used >= quota.total) {
        results.push([next.slug, `投稿枠がない（24時間で ${quota.used}/${quota.total}）`]);
        break;
      }

      const { mediaId, permalink } = await publishImage(url, next.caption);

      await prisma.socialPost.upsert({
        where: { slug: next.slug },
        update: { status: "posted", mediaId, permalink, postedAt: new Date(), error: null },
        create: { slug: next.slug, status: "posted", mediaId, permalink, postedAt: new Date() },
      });

      published += 1;
      results.push([next.slug, permalink ?? "投稿しました（URLは取得できず）"]);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "投稿に失敗しました";

      await prisma.socialPost.upsert({
        where: { slug: next.slug },
        update: { status: "failed", error: message },
        create: { slug: next.slug, status: "failed", error: message },
      });

      results.push([next.slug, `失敗：${message}`]);
      break;
    }
  }

  const remaining = pending.length - published;

  return diagPage(
    published > 0 ? `${published} 件投稿しました` : "投稿できませんでした",
    [
      ...results,
      ["残り", `${remaining} 件`],
      ["自動投稿", "毎日 10:00（JST）に1件ずつ。残りは放っておいても出ます"],
    ],
    remaining > 0
      ? { href: `/api/instagram/publish?ticket=${ticket}&count=3`, label: "続けて3件投稿する" }
      : undefined,
  );
}
