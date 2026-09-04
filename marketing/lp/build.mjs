// LP のビルド：img/*.png を data: URI に埋め込んだ published.html を出力する。
// Vercel などに置く場合は index.html をそのまま使えばよい（相対パスで画像を読む）。
// Artifact など外部画像を読めない環境向けに、こちらを使う。
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
let html = readFileSync(join(here, "index.html"), "utf8");

const inline = (name) => {
  const mime = name.endsWith(".png") ? "image/png" : "image/jpeg";
  return `data:${mime};base64,` + readFileSync(join(here, "img", name)).toString("base64");
};

const names = readdirSync(join(here, "img")).filter((n) => /\.(png|jpe?g)$/i.test(n));
const map = Object.fromEntries(names.map((n) => [n, inline(n)]));

// <img src="img/app-nail.png"> を差し替え
html = html.replace(/src="img\/([\w.-]+)"/g, (_, file) => `src="${map[file]}"`);

// JS 側の動的な差し替えも data: URI テーブルに置き換える
html = html.replace(
  'shot.src = "img/app-" + key + ".png";',
  "shot.src = SHOTS[key];",
);
const shots = Object.fromEntries(
  names.filter((n) => n.startsWith("app-")).map((n) => [n.slice(4, -4), map[n]]),
);
html = html.replace(
  "const TRADES = {",
  "const SHOTS = " + JSON.stringify(shots) + ";\n  const TRADES = {",
);

writeFileSync(join(here, "published.html"), html);

// Vercel から /lp で配信できるよう public にも書き出す（next.config.ts で /lp → /lp.html）
writeFileSync(join(here, "..", "..", "public", "lp.html"), html);

console.log("published.html / public/lp.html:", (html.length / 1024 / 1024).toFixed(2), "MB");
