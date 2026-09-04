// assets.html の各アートボードを 1080x1080 の PNG に書き出す。
import { chromium } from "playwright-core";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
await page.goto("file://" + join(here, "assets.html"));
await page.waitForTimeout(1200);

for (const el of await page.$$(".art")) {
  const name = await el.getAttribute("data-name");
  await el.screenshot({ path: join(here, "out", name + ".png") });
  console.log(name);
}
await browser.close();
