import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { cronAuthorized } from "@/lib/cron-auth";
import { imageIsReachable, publishImage, publishingQuota } from "@/lib/instagram";
import { QUEUE, imageUrl } from "@/lib/social-queue";

/**
 * 1日1回、キューの先頭から未投稿のものを1件だけ投稿する。
 * 画像がまだ置かれていない場合は投稿せずに待つ（キューを飛ばさない）。
 */
export async function GET(request: NextRequest) {
  if (!cronAuthorized(request)) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  if (!process.env.IG_ACCESS_TOKEN) {
    // 認証情報がまだ入っていない段階でも cron は毎日走る。500 で埋めない。
    return NextResponse.json({ status: "not_configured" });
  }

  const done = await prisma.socialPost.findMany({
    where: { status: "posted" },
    select: { slug: true },
  });
  const posted = new Set(done.map((row) => row.slug));

  const next = QUEUE.find((post) => !posted.has(post.slug));
  if (!next) return NextResponse.json({ status: "queue_empty" });

  const url = imageUrl(next.image);
  if (!(await imageIsReachable(url))) {
    // 画像待ち。キューは進めず、次回また同じものを試す。
    return NextResponse.json({ status: "waiting_for_image", slug: next.slug, url });
  }

  try {
    const quota = await publishingQuota();
    if (quota.used >= quota.total) {
      return NextResponse.json({ status: "quota_exceeded", quota });
    }

    const { mediaId, permalink } = await publishImage(url, next.caption);

    await prisma.socialPost.upsert({
      where: { slug: next.slug },
      update: { status: "posted", mediaId, permalink, postedAt: new Date(), error: null },
      create: {
        slug: next.slug,
        status: "posted",
        mediaId,
        permalink,
        postedAt: new Date(),
      },
    });

    return NextResponse.json({ status: "posted", slug: next.slug, permalink });
  } catch (error) {
    const message = error instanceof Error ? error.message : "投稿に失敗しました";

    await prisma.socialPost.upsert({
      where: { slug: next.slug },
      update: { status: "failed", error: message },
      create: { slug: next.slug, status: "failed", error: message },
    });

    // 失敗は次回また試す（status は failed のままだが posted ではないので再度拾われる）
    return NextResponse.json({ status: "failed", slug: next.slug, error: message }, { status: 500 });
  }
}
