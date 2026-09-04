// assets.html の各アートボードを 1080x1080 の PNG に書き出す。
import { chromium } from "playwright-core";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
// 環境ごとに Chrome の場所が違う。CHROME_PATH で上書きできるようにしておく。
const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
].filter(Boolean);

const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) throw new Error("Chrome が見つかりません。CHROME_PATH を指定してください");

const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
await page.goto("file://" + join(here, "assets.html"));
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1500);

for (const el of await page.$$(".art")) {
  const name = await el.getAttribute("data-name");
  await el.screenshot({ path: join(here, "out", name + ".png") });
  console.log(name);
}
await browser.close();
