// PNG を JPEG に変換・リサイズする。
// Instagram の image_url は JPEG しか受け付けないため、生成画像はここを通す。
//   node marketing/tools/to-jpeg.mjs <入力> <出力.jpg> [長辺px] [品質0-1]
import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";
import { extname } from "node:path";

const [input, output, maxSideArg = "1440", qualityArg = "0.88"] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: node marketing/tools/to-jpeg.mjs <in.png> <out.jpg> [maxSide] [quality]");
  process.exit(1);
}

const mime = extname(input).toLowerCase() === ".png" ? "image/png" : "image/jpeg";
const dataUrl = `data:${mime};base64,${readFileSync(input).toString("base64")}`;

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();

const jpeg = await page.evaluate(
  async ({ src, maxSide, quality }) => {
    const image = new Image();
    image.src = src;
    await image.decode();

    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    // JPEG は透過を持てないので、下地を白で塗ってから描く
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", quality);
  },
  { src: dataUrl, maxSide: Number(maxSideArg), quality: Number(qualityArg) },
);

writeFileSync(output, Buffer.from(jpeg.split(",")[1], "base64"));
await browser.close();

console.log(output, (readFileSync(output).length / 1024).toFixed(0) + "KB");
