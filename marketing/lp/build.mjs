// LP のビルド：img/*.png を data: URI に埋め込んだ published.html を出力する。
// Vercel などに置く場合は index.html をそのまま使えばよい（相対パスで画像を読む）。
// Artifact など外部画像を読めない環境向けに、こちらを使う。
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
let html = readFileSync(join(here, "index.html"), "utf8");

const inline = (name) =>
  "data:image/png;base64," + readFileSync(join(here, "img", name)).toString("base64");

const names = ["app-nail.png", "app-eyelash.png", "app-hair.png", "app-relax.png"];
const map = Object.fromEntries(names.map((n) => [n, inline(n)]));

// <img src="img/app-nail.png"> を差し替え
html = html.replace(/src="img\/([\w.-]+)"/g, (_, file) => `src="${map[file]}"`);

// JS 側の動的な差し替えも data: URI テーブルに置き換える
html = html.replace(
  'shot.src = "img/app-" + key + ".png";',
  "shot.src = SHOTS[key];",
);
html = html.replace(
  "const TRADES = {",
  "const SHOTS = " + JSON.stringify(Object.fromEntries(names.map((n) => [n.slice(4, -4), map[n]]))) + ";\n  const TRADES = {",
);

writeFileSync(join(here, "published.html"), html);
console.log("published.html:", (html.length / 1024 / 1024).toFixed(2), "MB");
