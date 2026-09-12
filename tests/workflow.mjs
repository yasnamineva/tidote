/**
 * The authenticated journey, against a running build and the real database.
 *
 * `tests/auth-flows.mjs` checks that the account pages render and say honest
 * things with no backend. This one signs in and does the work: saves
 * measurements, places an order, files a garment, and checks that each of
 * those survives a reload — plus the two failure modes that matter, a wrong
 * password and a second click on Place Order.
 *
 * It writes to whichever project `.env.local` points at, so everything it
 * creates is prefixed and deleted again at the end. Read the teardown before
 * running it anywhere you care about.
 *
 *   npm run test:workflow
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

const MARK = `TEST-${Date.now()}`;
const PORT = process.env.PORT || 3123;
const BASE = process.env.BASE_URL || `http://localhost:${PORT}`;

function env() {
  const out = {};
  try {
    for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
      const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
      if (m) out[m[1]] = m[2];
    }
  } catch {}
  return { ...out, ...process.env };
}
const E = env();

const bad = [];
const check = (ok, m) => {
  console.log(`  ${ok ? "PASS" : "** FAIL **"}  ${m}`);
  if (!ok) bad.push(m);
};

const creds = {
  email: E.NEXT_PUBLIC_DEMO_EMAIL,
  password: E.NEXT_PUBLIC_DEMO_PASSWORD,
};
if (!creds.email || !creds.password) {
  console.error("No NEXT_PUBLIC_DEMO_EMAIL / _PASSWORD in .env.local — nothing to sign in as.");
  process.exit(1);
}

async function reachable(url) {
  try {
    return (await fetch(url, { signal: AbortSignal.timeout(2000) })).ok;
  } catch {
    return false;
  }
}

let server = null;
if (!(await reachable(BASE))) {
  if (process.env.BASE_URL) {
    console.error(`Nothing is listening on ${BASE}.`);
    process.exit(1);
  }
  console.log("Building…");
  await new Promise((res, rej) => {
    const p = spawn("npx", ["next", "build"], { stdio: "inherit" });
    p.on("exit", (c) => (c === 0 ? res() : rej(new Error("build failed"))));
  });
  server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    stdio: "ignore",
    detached: true,
  });
  for (let i = 0; i < 60 && !(await reachable(BASE)); i++) {
    await new Promise((r) => setTimeout(r, 500));
  }
}

/** One-pixel PNG, so the upload path is exercised with a real image. */
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==",
  "base64"
);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
await ctx.addInitScript(() => {
  try {
    localStorage.setItem("tidote_lang", "bg");
  } catch {}
});
const page = await ctx.newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));

// ------------------------------------------------------------------ sign in
console.log("\nsigning in");
await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await page.waitForSelector('input[type="password"]', { timeout: 30000 });
await page.fill('input[type="email"]', creds.email);
await page.fill('input[type="password"]', "not-the-password-9999");
await page.locator('button[type="submit"]').first().click();
await page.waitForTimeout(3500);
const wrongMsg = (await page.locator('[role="alert"]').first().textContent()) || "";
check(!page.url().includes("/dashboard"), "a wrong password does not sign you in");
check(wrongMsg.trim().length > 0, `and says something: "${wrongMsg.trim().slice(0, 60)}"`);

await page.fill('input[type="password"]', creds.password);
await page.locator('button[type="submit"]').first().click();
await page.waitForURL(/\/dashboard/, { timeout: 30000 }).catch(() => {});
check(page.url().includes("/dashboard"), "the right password lands on the dashboard");
if (!page.url().includes("/dashboard")) {
  console.error("Cannot continue without a session.");
  await browser.close();
  if (server) process.kill(-server.pid);
  process.exit(1);
}

await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
check(page.url().includes("/dashboard"), "a reload keeps you signed in");

// ------------------------------------------------------------ measurements
console.log("\nmeasurements");
await page.waitForSelector("#chest", { timeout: 30000 });
const originalChest = await page.inputValue("#chest");
await page.fill("#chest", "104.5");
await page.locator('form:has(#chest) button[type="submit"]').first().click();
// The confirmation is deliberately temporary — it clears itself after 2.5s —
// so this has to look while it is still on screen.
const confirmed = await page
  .locator('text=/Мерките са запазени|Measurements updated/i')
  .first()
  .waitFor({ state: "visible", timeout: 8000 })
  .then(() => true)
  .catch(() => false);
check(confirmed, "saving says it saved");
await page.waitForTimeout(1500);
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForSelector("#chest", { timeout: 30000 });
await page.waitForTimeout(2500);
check((await page.inputValue("#chest")) === "104.5", "and the value is still there after a reload");

// A negative measurement is refused by the field itself, so the form never
// submits it.
await page.fill("#chest", "-5");
check(
  await page.evaluate(() => document.getElementById("chest").checkValidity() === false),
  "a negative measurement is rejected before it is sent"
);
await page.fill("#chest", originalChest || "");

// ------------------------------------------------------------------ orders
console.log("\norders");
await page.goto(`${BASE}/dashboard/new-order`, { waitUntil: "domcontentloaded" });
await page.waitForSelector("#piece", { timeout: 30000 });
const submit = page.locator('button[type="submit"]').first();
await submit.click();
await page.waitForTimeout(1200);
check(page.url().includes("/new-order"), "an empty order form does not submit");

await page.fill("#piece", `${MARK} jacket`);
await page.fill("#notes", "Placed by tests/workflow.mjs");
// Two clicks as fast as the browser allows: the guard is what stops the
// second one becoming a second order.
await submit.click();
await submit.click({ force: true }).catch(() => {});
await page.waitForURL(/\/dashboard$/, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(4000);
const shown = await page.locator(`text=${MARK}`).count();
check(shown === 1, `the order appears once, not twice (found ${shown})`);

await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
check((await page.locator(`text=${MARK}`).count()) >= 1, "and it is still there after a reload");

// ---------------------------------------------------------------- wardrobe
console.log("\nwardrobe upload");
await page.locator("#wardrobe").scrollIntoViewIfNeeded();
await page.waitForSelector("#wardrobe-name", { timeout: 30000 });
await page.fill("#wardrobe-name", `${MARK} coat`);
await page.setInputFiles("#wardrobe input[type=file]", {
  name: "probe.png",
  mimeType: "image/png",
  buffer: PNG,
});
// The file goes to storage before the row is written, and how long that takes
// is the network's business. Wait for the thumbnail, which is the proof it
// landed, rather than for a number of seconds.
const uploaded = await page
  .locator("#wardrobe img")
  .first()
  .waitFor({ state: "visible", timeout: 30000 })
  .then(() => true)
  .catch(() => false);
check(uploaded, "the photo uploads");
await page.locator('#wardrobe button[type="submit"]').first().click();
const filed = await page
  .locator(`text=${MARK} coat`)
  .first()
  .waitFor({ state: "visible", timeout: 30000 })
  .then(() => true)
  .catch(() => false);
check(filed, "a garment with a photo is filed");
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
check((await page.locator(`text=${MARK} coat`).count()) >= 1, "and it survives a reload");

// ------------------------------------------------------- nothing leaks out
console.log("\nno raw values on screen");
for (const path of ["/dashboard", "/dashboard/new-order"]) {
  await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3500);
  const text = await page.evaluate(() => document.body.innerText);
  const leak = /\bundefined\b|\bNaN\b|\[object Object\]/.exec(text);
  check(!leak, `${path} shows no undefined/NaN${leak ? ` (${leak[0]})` : ""}`);
}

// ------------------------------------------------------- the phone journey
// The same path a customer takes, at the width most of them are on. Three
// things go wrong at this size and nowhere else: the page scrolls sideways,
// something pinned sits on top of the field you are typing in, and a button
// is too small to hit.
console.log("\nthe journey on a phone (390px)");
await page.setViewportSize({ width: 390, height: 780 });

const JOURNEY = ["/", "/casual", "/in-stock", "/dashboard", "/dashboard/new-order"];

for (const path of JOURNEY) {
  await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);

  // 320 as well as 390, and with the order placed above still on the account:
  // the layout suite sees this page empty, and an empty order list is the easy
  // case. The overflow that started this check came from an order whose price
  // has not been quoted yet.
  const over = {};
  for (const w of [320, 390]) {
    await page.setViewportSize({ width: w, height: 780 });
    await page.waitForTimeout(500);
    const px = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    if (px > 2) over[w] = px;
  }
  await page.setViewportSize({ width: 390, height: 780 });
  await page.waitForTimeout(400);
  const overDesc = Object.entries(over).map(([w, px]) => `${w}:+${px}px`).join(" ");
  check(Object.keys(over).length === 0, `${path} does not scroll sideways${overDesc ? ` (${overDesc})` : ""}`);

  // Anything you are meant to press has to be big enough to press.
  const small = await page.evaluate(() => {
    const out = [];
    // A file input's height is the browser's own control, not ours; that it
    // fits on the screen is checked separately.
    for (const el of document.querySelectorAll("button, a[href]")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.pointerEvents === "none") continue;
      // Several of the small markers carry an invisible ::before square that
      // is the thing a thumb actually hits. Measure that, not the ink.
      const before = getComputedStyle(el, "::before");
      const grown =
        before.position === "absolute" ? parseFloat(before.height) || 0 : 0;
      const height = Math.max(r.height, grown);
      // Links inside running text are read, not aimed at.
      const inline = cs.display === "inline" && el.closest("p,li,dd,figcaption");
      if (!inline && height < 30) {
        out.push(
          `${el.tagName.toLowerCase()} "${(el.innerText || "").trim().slice(0, 18)}" ${Math.round(height)}px`
        );
      }
    }
    return out.slice(0, 4);
  });
  check(small.length === 0, `${path} tap targets are big enough${small.length ? ` (${small.join(", ")})` : ""}`);
}

// The menu is the only way around at this width.
await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
const burger = page.locator('header button[aria-label="Toggle menu"]').first();
await burger.click();
await page.waitForTimeout(900);
const navVisible = await page.evaluate(() => {
  // The header carries two copies of every link — the wide-screen bar and the
  // panel — and at this width the first one in the document is the hidden
  // one. So: is *any* of them on screen.
  return [...document.querySelectorAll('header a[href="/in-stock"]')].some((a) => {
    const r = a.getBoundingClientRect();
    return r.height > 0 && r.top >= 0 && r.top < window.innerHeight;
  });
});
check(navVisible, "the phone menu opens onto the navigation");

// Typing: whatever is pinned at the top must not be sitting on the field.
await page.goto(BASE + "/dashboard", { waitUntil: "domcontentloaded" });
await page.waitForSelector("#chest", { timeout: 30000 });
await page.waitForTimeout(2500);
await page.locator("#chest").scrollIntoViewIfNeeded();
await page.locator("#chest").focus();
await page.waitForTimeout(600);
const covered = await page.evaluate(() => {
  const r = document.getElementById("chest").getBoundingClientRect();
  let bottom = 0;
  for (const el of document.body.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (cs.position !== "fixed" && cs.position !== "sticky") continue;
    const b = el.getBoundingClientRect();
    // Only things pinned across the top of the screen can cover a field.
    if (b.height === 0 || b.top > 120 || b.width < window.innerWidth * 0.6) continue;
    bottom = Math.max(bottom, b.bottom);
  }
  return { fieldTop: Math.round(r.top), stickyBottom: Math.round(bottom) };
});
check(
  covered.fieldTop >= covered.stickyBottom - 1,
  `the field you type in is not under the header (field ${covered.fieldTop}px, header ends ${covered.stickyBottom}px)`
);

// The account menu on a phone is a drawer behind a pinned button, and the way
// out has to be inside it.
const drawerButton = page.locator("button:has-text('МЕНЮ'), button:has-text('MENU')").first();
if ((await drawerButton.count()) > 0) {
  await drawerButton.click();
  await page.waitForTimeout(900);
  const logoutReachable = await page.evaluate(() =>
    // Same two-copies story as the header: the wide-screen column is still in
    // the document at this width, collapsed to nothing.
    [...document.querySelectorAll("button")]
      .filter((x) => /Изход|Log out/i.test(x.innerText || ""))
      .some((x) => {
        const r = x.getBoundingClientRect();
        return r.height > 0 && r.top >= 0 && r.bottom <= window.innerHeight + 1;
      })
  );
  check(logoutReachable, "the account drawer opens with the way out inside it");
} else {
  check(false, "the account menu has a button on a phone");
}

// The upload control, which is the step most likely to be unreachable.
await page.goto(BASE + "/dashboard/new-order", { waitUntil: "domcontentloaded" });
await page.waitForSelector("#piece", { timeout: 30000 });
await page.waitForTimeout(2000);
const fileBox = await page.locator('input[type="file"]').first().boundingBox();
check(
  !!fileBox && fileBox.x >= 0 && fileBox.x + fileBox.width <= 390,
  "the photo picker fits the screen"
);

await page.setViewportSize({ width: 1280, height: 1000 });

// ------------------------------------------------------------------ logout
console.log("\nsigning out");
await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(3000);
const out = page.locator('button:has-text("Изход"), button:has-text("Log out")').first();
if ((await out.count()) > 0) {
  await out.click();
  await page.waitForTimeout(3500);
}
await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
check(page.url().includes("/login"), "the dashboard is closed once you are out");

check(pageErrors.length === 0, `no uncaught page errors${pageErrors.length ? `: ${pageErrors[0]}` : ""}`);

await browser.close();

// ---------------------------------------------------------------- teardown
// Everything created above carries MARK. Removed with the service key, which
// is the only thing here that can delete a client's row.
console.log("\nteardown");
const url = E.NEXT_PUBLIC_SUPABASE_URL;
const key = E.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.log(`  ** no service key: delete anything named ${MARK} by hand **`);
} else {
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  for (const [table, column] of [["orders", "piece"], ["wardrobe_items", "name"]]) {
    const res = await fetch(
      `${url}/rest/v1/${table}?${column}=like.${MARK}*`,
      { method: "DELETE", headers: { ...headers, Prefer: "return=representation" } }
    );
    const rows = res.ok ? await res.json() : [];
    console.log(`  removed ${rows.length} from ${table}${res.ok ? "" : ` (HTTP ${res.status})`}`);
    if (!res.ok) bad.push(`teardown failed for ${table}`);
  }
  // The notifications those actions raised in the studio's bell.
  const res = await fetch(`${url}/rest/v1/notifications?text=like.*${MARK}*`, {
    method: "DELETE",
    headers: { ...headers, Prefer: "return=representation" },
  });
  if (res.ok) console.log(`  removed ${(await res.json()).length} notifications`);
}

if (server) process.kill(-server.pid);
console.log(bad.length ? `\n${bad.length} FAILED\n` : "\nall workflow checks passed\n");
process.exit(bad.length ? 1 : 0);
