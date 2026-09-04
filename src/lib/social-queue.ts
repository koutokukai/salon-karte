import "server-only";
import queue from "../../content/instagram-queue.json";

export type QueuedPost = { slug: string; image: string; caption: string };

export const QUEUE: QueuedPost[] = queue.posts;

/** 画像の公開URL。Instagram 側から取得できる必要があるため絶対URLで返す。 */
export function imageUrl(image: string) {
  const base =
    process.env.SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null);
  if (!base) throw new Error("SITE_URL が未設定です");
  return `${base.replace(/\/$/, "")}/social/${image}`;
}
