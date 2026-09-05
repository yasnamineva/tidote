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
import { chromium } from "playwright";

const WIDTHS = [320, 375, 390, 430, 768, 1024, 1100, 1280, 1440, 1920];
const PAGES = [
  "/",
  "/casual",
  "/sports",
  "/in-stock",
  "/login",
  "/signup",
  "/reset-password",
  "/privacy",
];
const LANGS = ["bg", "en"];

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

/** Runs in the page. Returns everything that paints where it should not. */
function findCollisions() {
  const de = document.documentElement;
  const out = { scrollX: de.scrollWidth - de.clientWidth, hits: [], outside: [] };
  const vw = de.clientWidth;

  // An ancestor clipped to nothing — the closed menu panel is `max-h-0
  // overflow-hidden` — leaves its children with full-size rectangles that
  // paint nowhere at all.
  const clipped = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (!/hidden|clip/.test(cs.overflowY) && !/hidden|clip/.test(cs.overflowX)) continue;
      const r = p.getBoundingClientRect();
      if (r.height < 2 || r.width < 2) return true;
    }
    return false;
  };

  // Only elements in normal flow. This design deliberately stacks positioned
  // things — hero copy over photographs — and that is not a collision.
  const leaves = [...document.querySelectorAll("body *")].filter((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return false;
    if (cs.position !== "static") return false;
    const b = el.getBoundingClientRect();
    if (b.width <= 0 || b.height <= 0) return false;
    if (el.closest("[aria-hidden='true']")) return false;
    const text = el.textContent.trim();
    if (!text) return false;
    // Keep the innermost element holding a given string, not its wrappers.
    if ([...el.children].some((c) => c.textContent.trim() === text)) return false;
    return !clipped(el);
  });

  for (let i = 0; i < leaves.length; i++) {
    for (let j = i + 1; j < leaves.length; j++) {
      const A = leaves[i];
      const B = leaves[j];
      if (A.contains(B) || B.contains(A)) continue;
      const a = A.getBoundingClientRect();
      const b = B.getBoundingClientRect();
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 2 && oy > 2) {
        out.hits.push(
          `"${A.textContent.trim().slice(0, 24)}" over "${B.textContent.trim().slice(0, 24)}" (${Math.round(ox)}×${Math.round(oy)}px)`
        );
      }
    }
  }
  for (const el of leaves) {
    const b = el.getBoundingClientRect();
    if (b.right > vw + 2 || b.left < -2) {
      out.outside.push(`"${el.textContent.trim().slice(0, 24)}" at ${Math.round(b.left)}..${Math.round(b.right)} of ${vw}`);
    }
  }
  out.hits = [...new Set(out.hits)].slice(0, 5);
  out.outside = [...new Set(out.outside)].slice(0, 5);
  return out;
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

await browser.close();
if (server) process.kill(-server.pid);

console.log(
  failures
    ? `\n${failures} of ${checks} layouts are broken.`
    : `\n${checks} layouts checked, all clear.`
);
process.exit(failures ? 1 : 0);
