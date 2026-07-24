import { chromium } from "playwright";
import path from "node:path";

const shotsDir =
  "/private/tmp/claude-501/-Users-mineva-Documents-side-tidote/e3354e71-3d2e-4299-8773-24d4ddd06e44/scratchpad/screenshots";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
const marquee = page.locator(".marquee-track").first();
await marquee.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const wrapper = marquee.locator("..");
const box = await wrapper.boundingBox();
await page.screenshot({
  path: path.join(shotsDir, "v5-04-home-marquee-actual.png"),
  clip: { x: 0, y: box.y, width: 1400, height: box.height },
});
await browser.close();
