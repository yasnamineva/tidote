/**
 * What tidoteatelier.com is actually serving.
 *
 * The other suites run against a build on this machine. This one asks the
 * live site, which is the only thing that answers the question the studio
 * actually has — "is it right, now, for someone opening it?" Run it after
 * every deploy.
 *
 * It lived in a scratch directory for a while and went stale twice, quietly
 * failing on class names that had been renamed hours earlier. In here it is
 * changed alongside the code it checks.
 *
 *   npm run test:prod
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "https://tidoteatelier.com";
const bad = [];
const check = (ok, m) => {
  console.log(`  ${ok ? "PASS" : "** FAIL **"}  ${m}`);
  if (!ok) bad.push(m);
};

const browser = await chromium.launch();

// ---------------------------------------------------------------- the hero
for (const [w, h] of [[1440, 950], [390, 800]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("tidote_lang", "bg");
    } catch {}
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(6000);

  const tag = await page.evaluate(() => {
    const settle = document.querySelector(".tag-settle");
    const nudge = document.querySelector(".tag-nudge");
    return {
      cards: document.querySelectorAll(".tag-fall").length,
      settle: settle ? getComputedStyle(settle).transform : "missing",
      nudge: nudge ? getComputedStyle(nudge).rotate : "missing",
    };
  });
  // "none" is what an identity transform computes to; either means at rest.
  const still = ["none", "matrix(1, 0, 0, 1, 0, 0)"];
  check(still.includes(tag.settle), `${w}px: the tag has settled (${tag.settle.slice(0, 28)})`);
  check(still.includes(tag.nudge) || tag.nudge === "0deg", `${w}px: and is not leaning (${tag.nudge})`);
  check(tag.cards === 1, `${w}px: one tag, not two`);

  const over = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  check(over <= 2, `${w}px: no sideways scroll`);
  check(errors.length === 0, `${w}px: no page errors${errors.length ? `: ${errors[0].slice(0, 60)}` : ""}`);
  await ctx.close();
}

const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
await ctx.addInitScript(() => {
  try {
    localStorage.setItem("tidote_lang", "bg");
  } catch {}
});
const page = await ctx.newPage();

// ------------------------------------------------------- the wall of names
await page.goto(`${BASE}/worn-by`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
const worn = await page.evaluate(() => document.body.innerText);
check(!/Мартин Стоев/.test(worn), "/worn-by shows no invented customer");
check(/още се подрежда/i.test(worn), "and says the wall is still being hung");
await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(3000);
check(
  (await page.locator('header a[href="/worn-by"]').count()) === 0,
  "the menu does not link to it yet"
);

// ------------------------------------------------------------ the offer
await page.goto(`${BASE}/casual`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
const cat = await page.evaluate(() => document.body.innerText);
check(/Как става поръчката по мярка/i.test(cat), "/casual explains how a commission works");
check(/Цена при запитване/i.test(cat), "and says the price is on enquiry rather than inventing one");
check(!/\bundefined\b|\bNaN\b|€0\b/.test(cat), "with no undefined, NaN or €0");

await page.goto(`${BASE}/in-stock`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(8000);
const rail = await page.evaluate(() => document.body.innerText);
check(!/Зареждане…\s*$/.test(rail.trim()), "/in-stock is not stuck on loading");
check(/модел|закачалката/i.test(rail), "and shows the rail");

// -------------------------------------------------------- the studio door
const claim = await page.request.post(`${BASE}/api/studio/claim`, {
  data: {
    email: `nobody-${Date.now()}@tidote.invalid`,
    password: "long-enough-password",
  },
});
const body = await claim.json().catch(() => ({}));
console.log(`    /api/studio/claim answered ${claim.status()} ${JSON.stringify(body)}`);
// `refused` once the migrations are applied, `not_configured` before that.
check(["refused", "not_configured"].includes(body.code), "the studio door answers with a code");
check(claim.status() !== 201, "and lets nobody in");
check(!JSON.stringify(body).includes("admin_emails"), "without naming the allow-list");

await page.goto(`${BASE}/studio-setup`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(3500);
check(
  (await page.locator("#studio-email").count()) === 1 &&
    (await page.locator("#studio-password").count()) === 1 &&
    (await page.locator("#studio-code").count()) === 0,
  "/studio-setup asks for an address and a password, and nothing else"
);

// ------------------------------------------------------ robots and sitemap
const robots = await (await fetch(`${BASE}/robots.txt`)).text();
check(/Disallow: \/studio-setup/.test(robots), "robots.txt keeps the setup page out of search");
const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
check(!/worn-by/.test(sitemap), "and the sitemap does not offer the empty wall");

await browser.close();
console.log(bad.length ? `\n${bad.length} FAILED\n` : "\nproduction looks right\n");
process.exit(bad.length ? 1 : 0);
