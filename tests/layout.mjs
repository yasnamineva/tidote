/**
 * Layout regression test.
 *
 * The desktop navigation used to appear at 1024px while needing about 1215px
 * of room, so the header's three clusters were squeezed into each other and the
 * wordmark printed on top of the first nav item. Nothing caught it, because
 * `body { overflow-x: clip }` hides the overflow instead of producing a
 * scrollbar — the page looked fine to every check we had, and broken to the
 * eye.
 *
 * So this checks with the eye's definition: no two pieces of in-flow text may
 * paint on top of each other, and nothing may sit outside the viewport, at any
 * of the widths below, in either language. Bulgarian and English are both
 * tested because their label lengths differ by enough to break one and not the
 * other.
 *
 * Run against an already-running server:  BASE_URL=http://localhost:3000 node tests/layout.mjs
 * Otherwise it builds and starts one itself.
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import { findCollisions } from "./dom-checks.mjs";

const WIDTHS = [320, 375, 390, 430, 768, 1024, 1100, 1280, 1440, 1920];
const PAGES = [
  "/",
  "/casual",
  "/sports",
  "/in-stock",
  "/worn-by",
  "/login",
  "/signup",
  "/reset-password",
  "/privacy",
];
const LANGS = ["bg", "en"];

/**
 * Pages you can only see once you have signed in.
 *
 * These are why this list exists: the header carries a different set of
 * controls when signed in — a bell and an account button in place of one
 * login button — and that set is wider. It fitted the bar by four pixels, so
 * the wordmark sat against the first menu item with nothing between them.
 * Every check here passed throughout, because none of them had ever seen a
 * signed-in page.
 */
const PRIVATE_PAGES = ["/dashboard", "/dashboard/new-order"];

/** Read from .env.local so the suite needs no arguments. */
function demoCredentials() {
  try {
    const env = {};
    for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
      const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
      if (m) env[m[1]] = m[2];
    }
    const email = process.env.NEXT_PUBLIC_DEMO_EMAIL || env.NEXT_PUBLIC_DEMO_EMAIL;
    const password = process.env.NEXT_PUBLIC_DEMO_PASSWORD || env.NEXT_PUBLIC_DEMO_PASSWORD;
    return email && password ? { email, password } : null;
  } catch {
    return null;
  }
}

const PORT = process.env.PORT || 3123;
const BASE = process.env.BASE_URL || `http://localhost:${PORT}`;

async function reachable(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit" });
    p.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))
    );
  });
}

let server = null;
if (!(await reachable(BASE))) {
  if (process.env.BASE_URL) {
    console.error(`Nothing is listening on ${BASE}.`);
    process.exit(1);
  }
  console.log("Building…");
  await run("npx", ["next", "build"]);
  server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    stdio: "ignore",
    detached: true,
  });
  for (let i = 0; i < 40 && !(await reachable(BASE)); i++) {
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!(await reachable(BASE))) {
    console.error("Server never came up.");
    process.exit(1);
  }
}

const browser = await chromium.launch();
let failures = 0;
let checks = 0;

for (const lang of LANGS) {
  const ctx = await browser.newContext({ viewport: { width: WIDTHS[0], height: 900 } });
  await ctx.addInitScript((l) => {
    try {
      localStorage.setItem("tidote_lang", l);
    } catch {}
  }, lang);
  const page = await ctx.newPage();

  for (const path of PAGES) {
    // Navigate once and resize in place. Re-navigating an image-heavy page for
    // every width stalls the browser, and resizing exercises the same rules.
    await page.setViewportSize({ width: WIDTHS[0], height: 900 });
    await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("header", { timeout: 30000 });
    await page.waitForTimeout(500);

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(250);
      checks++;
      const r = await page.evaluate(findCollisions);
      if (!r.hits.length && !r.outside.length && r.scrollX <= 2) continue;
      failures++;
      console.log(`\n✗ [${lang}] ${path} @${width}px`);
      if (r.scrollX > 2) console.log(`    page scrolls ${r.scrollX}px sideways`);
      r.hits.forEach((h) => console.log("    overlap:", h));
      r.outside.forEach((h) => console.log("    outside:", h));
    }
  }
  await ctx.close();
}

// The signed-in pass. Skipped rather than failed when there is no demo
// account to sign in with — a checkout without a database still gets the
// public pages checked.
const creds = demoCredentials();
if (!creds) {
  console.log("\nNo demo credentials in .env.local — skipped the signed-in pages.");
} else {
  for (const lang of LANGS) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript((l) => {
      try {
        localStorage.setItem("tidote_lang", l);
      } catch {}
    }, lang);
    const page = await ctx.newPage();
    await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
    await page.waitForSelector('input[type="password"]', { timeout: 30000 });
    await page.fill('input[type="email"]', creds.email);
    await page.fill('input[type="password"]', creds.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);

    if (!page.url().includes("/dashboard")) {
      console.log(`\nCould not sign in as ${creds.email} — skipped the signed-in pages.`);
      console.log("  (Run `npm run seed` if the demo account has not been created.)");
      await ctx.close();
      break;
    }

    for (const path of PRIVATE_PAGES) {
      await page.setViewportSize({ width: WIDTHS[0], height: 900 });
      await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
      await page.waitForSelector("header", { timeout: 30000 });
      await page.waitForTimeout(1200);

      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);
        checks++;
        const r = await page.evaluate(findCollisions);
        if (!r.hits.length && !r.outside.length && r.scrollX <= 2) continue;
        failures++;
        console.log(`\n\u2717 [${lang}] ${path} @${width}px (signed in)`);
        if (r.scrollX > 2) console.log(`    page scrolls ${r.scrollX}px sideways`);
        r.hits.forEach((h) => console.log("    overlap:", h));
        r.outside.forEach((h) => console.log("    outside:", h));
      }
    }
    await ctx.close();
  }
}

await browser.close();
if (server) process.kill(-server.pid);

console.log(
  failures
    ? `\n${failures} of ${checks} layouts are broken.`
    : `\n${checks} layouts checked, all clear.`
);
process.exit(failures ? 1 : 0);
