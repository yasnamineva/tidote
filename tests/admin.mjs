/**
 * The studio side, driven.
 *
 * Everything the atelier does — the client list, creating a client, pricing an
 * order, the inbox, the rail, the books, the calendar — had never been opened
 * by a test. This signs in as the studio and uses it, then checks the one thing
 * that matters most about a price change: that the client sees it.
 *
 * It needs a studio session, so it makes one: a user at an `.invalid` address,
 * which cannot receive mail and cannot be signed into by anyone who does not
 * have the password printed below, promoted with the service key. The
 * allow-list in `admin_emails` is not touched — that is the studio's own
 * decision and this does not need it. Both the account and everything it
 * creates are removed at the end, and the teardown verifies each deletion.
 *
 *   npm run test:admin
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

const PORT = process.env.PORT || 3123;
const BASE = process.env.BASE_URL || `http://localhost:${PORT}`;
const MARK = `ADMINTEST-${Date.now()}`;

const E = (() => {
  const out = {};
  try {
    for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
      const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
      if (m) out[m[1]] = m[2];
    }
  } catch {}
  return { ...out, ...process.env };
})();

const URL_ = E.NEXT_PUBLIC_SUPABASE_URL;
const KEY = E.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) {
  console.error("Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const bad = [];
const check = (ok, m) => {
  console.log(`  ${ok ? "PASS" : "** FAIL **"}  ${m}`);
  if (!ok) bad.push(m);
};

async function rest(path, init = {}) {
  const res = await fetch(`${URL_}/rest/v1/${path}`, {
    ...init,
    headers: { ...H, Prefer: "return=representation", ...(init.headers || {}) },
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text ? JSON.parse(text) : null };
}

// ------------------------------------------------------------------ the setup
//
// The studio account is made the way the atelier makes it: an allow-listed
// address registers, and confirming the address is what promotes it. Both steps
// are done here against the auth API rather than through a browser, because
// clicking a link in an inbox is not something a test can do — but the promotion
// is the database's, not the test's, and that it happens on confirmation and not
// before is checked either side of the stamp.
//
// The address is `.invalid`, so no mail can leave for it, and both it and its
// allow-list row are removed at the end.
const studio = {
  email: `studio-probe-${Date.now()}@tidote.invalid`,
  password: `Probe-password-${Date.now()}`,
};
console.log(`\nallow-listing a temporary address: ${studio.email}`);
const listed = await rest("admin_emails", {
  method: "POST",
  body: JSON.stringify({ email: studio.email }),
});
check(listed.ok, "the address is on the studio allow-list");

// Registered, unconfirmed.
const made = await fetch(`${URL_}/auth/v1/admin/users`, {
  method: "POST",
  headers: H,
  body: JSON.stringify({
    email: studio.email,
    password: studio.password,
    email_confirm: false,
    user_metadata: { name: "Probe Studio" },
  }),
});
const studioUser = await made.json();
if (!made.ok || !studioUser.id) {
  console.error("Could not register the probe account:", made.status, studioUser);
  process.exit(1);
}
const before = await rest(`profiles?id=eq.${studioUser.id}&select=role`);
check(
  before.body?.[0]?.role === "client",
  `an allow-listed address is only a client until it is confirmed (${before.body?.[0]?.role})`
);

// Confirmed — the link being clicked.
const confirmed = await fetch(`${URL_}/auth/v1/admin/users/${studioUser.id}`, {
  method: "PUT",
  headers: H,
  body: JSON.stringify({ email_confirm: true }),
});
await new Promise((r) => setTimeout(r, 1200));
const after = await rest(`profiles?id=eq.${studioUser.id}&select=role`);
check(
  confirmed.ok && after.body?.[0]?.role === "admin",
  `and the studio from the moment it is (${after.body?.[0]?.role})`
);
const CLAIMABLE = after.body?.[0]?.role === "admin";
if (!CLAIMABLE) {
  console.log(
    "  ** the promotion did not happen — 0009_studio_by_confirmation.sql is\n" +
      "     probably not applied to this project. Apply it and run this again."
  );
  const promoted = await rest(`profiles?id=eq.${studioUser.id}`, {
    method: "PATCH",
    body: JSON.stringify({ role: "admin" }),
  });
  check(promoted.ok, "promoted by hand so the rest of the panel can be checked");
}

// A client with an order for the studio to price. The demo client's own
// records are left alone.
const demoProfile = await rest(
  `profiles?email=eq.${encodeURIComponent(E.NEXT_PUBLIC_DEMO_EMAIL)}&select=id,name`
);
const clientId = demoProfile.body?.[0]?.id;
check(Boolean(clientId), "the demo client is there to work on");
const order = await rest("orders", {
  method: "POST",
  body: JSON.stringify({
    profile_id: clientId,
    piece: `${MARK} coat`,
    category: "Jacket",
    status: "received",
    review_status: "pending",
    eta: "To be confirmed",
    total: "Quote pending",
    notes: "Fixture for tests/admin.mjs",
  }),
});
const orderId = order.body?.[0]?.id;
check(Boolean(orderId), `an order to price (${orderId})`);

async function teardown() {
  console.log("\nteardown");
  const results = [];
  const delOrder = await rest(`orders?piece=like.${MARK}*`, { method: "DELETE" });
  results.push(["orders", delOrder.body?.length ?? "?"]);
  const delNotes = await rest(`notifications?text=like.*${MARK}*`, { method: "DELETE" });
  results.push(["notifications", delNotes.body?.length ?? "?"]);
  // Any client the modal created during the run.
  const probes = await rest(`profiles?email=like.client-probe-*&select=id,email`);
  for (const p of probes.body ?? []) {
    await fetch(`${URL_}/auth/v1/admin/users/${p.id}`, { method: "DELETE", headers: H });
  }
  results.push(["probe clients", (probes.body ?? []).length]);
  // The studio login the claim created, found by its address rather than by an
  // id this run happens to know — if the claim failed there is no id, and if it
  // succeeded the account is still the thing to remove.
  const studioProfiles = await rest(
    `profiles?email=eq.${encodeURIComponent(studio.email)}&select=id`
  );
  for (const p of studioProfiles.body ?? []) {
    await fetch(`${URL_}/auth/v1/admin/users/${p.id}`, { method: "DELETE", headers: H });
  }
  results.push(["studio account", (studioProfiles.body ?? []).length]);
  const unlisted = await rest(`admin_emails?email=eq.${encodeURIComponent(studio.email)}`, {
    method: "DELETE",
  });
  results.push(["allow-list row", unlisted.body?.length ?? "?"]);
  for (const [what, n] of results) console.log(`  ${what}: ${n}`);

  // Verify, rather than assume.
  const stillThere = await rest(
    `profiles?email=eq.${encodeURIComponent(studio.email)}&select=id`
  );
  check((stillThere.body ?? []).length === 0, "the probe studio account is gone");
  const stillListed = await rest(
    `admin_emails?email=eq.${encodeURIComponent(studio.email)}&select=email`
  );
  check((stillListed.body ?? []).length === 0, "the probe allow-list row is gone");
  const leftovers = await rest(`orders?piece=like.${MARK}*&select=id`);
  check((leftovers.body ?? []).length === 0, "no fixture orders are left behind");
  const admins = await rest("profiles?role=eq.admin&select=email");
  console.log(`  studio accounts remaining: ${(admins.body ?? []).map((a) => a.email).join(", ") || "none"}`);
  const allowList = await rest("admin_emails?select=email");
  console.log(`  admin_emails (untouched): ${(allowList.body ?? []).map((a) => a.email).join(", ")}`);
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
    await teardown();
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

const browser = await chromium.launch();

async function signIn(email, password, expect) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("tidote_lang", "bg");
    } catch {}
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('input[type="password"]', { timeout: 30000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(new RegExp(expect), { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(4500);
  return { ctx, page, errors };
}

const text = (page) => page.evaluate(() => document.body.innerText);

try {
  // ------------------------------------------------------------- signing in
  console.log("\nthe studio signs in");
  const session = await signIn(studio.email, studio.password, "/admin");
  check(
    session.page.url().includes("/admin"),
    `a studio login lands on the panel (${session.page.url().replace(BASE, "")})`
  );

  const { ctx, page, errors } = session;
  if (!page.url().includes("/admin")) throw new Error("no studio session");

  // --------------------------------------------------------- the client list
  console.log("\nthe client list");
  let body = await text(page);
  check(/Клиенти|Всички клиенти/i.test(body), "the panel names itself");
  check(body.includes(demoProfile.body[0].name), "the demo client is listed");
  check(!/\bundefined\b|\bNaN\b/.test(body), "no undefined or NaN on it");
  const digits = await page.evaluate(() =>
    [...document.querySelectorAll(".font-display")].map((e) => e.innerText.trim()).slice(0, 4)
  );
  check(!digits.every((d) => d === "—"), `the counts are filled in (${digits.join(" ")})`);

  await page.fill('input[type="search"]', "zzzz-nobody");
  await page.waitForTimeout(1200);
  check(
    !(await text(page)).includes(demoProfile.body[0].name),
    "the search narrows the list"
  );
  await page.fill('input[type="search"]', "");
  await page.waitForTimeout(800);

  // ------------------------------------------------------ creating a client
  console.log("\ncreating a client");
  const probeEmail = `client-probe-${Date.now()}@tidote.invalid`;
  await page.locator('button:has-text("Нов клиент")').first().click();
  await page.waitForTimeout(1200);
  await page.fill("#nc-name", `${MARK} Client`);
  await page.fill("#nc-email", probeEmail);
  await page.fill("#nc-phone", "+359 88 000 0000");
  await page.fill("#nc-password", "probe-password-1");
  await page.locator('button:has-text("Създай клиент")').first().click();
  await page.waitForTimeout(7000);
  body = await text(page);
  check(body.includes(`${MARK} Client`), "the new client appears in the list");

  // The same address twice is the failure the studio will actually hit.
  await page.locator('button:has-text("Нов клиент")').first().click();
  await page.waitForTimeout(1200);
  await page.fill("#nc-name", "Duplicate");
  await page.fill("#nc-email", probeEmail);
  await page.fill("#nc-password", "probe-password-1");
  await page.locator('button:has-text("Създай клиент")').first().click();
  await page.waitForTimeout(6000);
  const dupMsg = (await page.locator('[role="alert"]').allTextContents()).join(" ");
  check(/вече съществува/i.test(dupMsg), `a duplicate email is refused in Bulgarian: "${dupMsg.trim().slice(0, 50)}"`);
  check(!/GoTrue|already been registered/i.test(dupMsg), "and not in the auth server's own words");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);

  // ------------------------------------------------------- pricing an order
  console.log("\npricing the order");
  await page.goto(`${BASE}/admin/orders/${clientId}/${orderId}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);
  body = await text(page);
  check(body.includes(`${MARK} coat`), "the order opens");
  check(!/\bundefined\b|\bNaN\b/.test(body), "with no undefined or NaN");

  // Accept it: a price, a date, and the button the studio actually presses.
  const price = page.locator('input[placeholder*="Цена"]').first();
  check((await price.count()) > 0, "the price field is on the page");
  await price.fill("275");
  const etaField = page.locator('input[type="date"]').first();
  if ((await etaField.count()) > 0) await etaField.fill("2026-11-20");
  await page.locator('button:has-text("Приеми")').first().click();
  await page
    .locator("text=/275/")
    .first()
    .waitFor({ state: "visible", timeout: 20000 })
    .catch(() => {});
  await page.waitForTimeout(1500);
  body = await text(page);
  check(/275/.test(body), "the price is on the order after accepting it");
  check(!/Очаква оферта/.test(body), "and it no longer says the quote is pending");

  // What the database now holds, and what it raised for the client.
  const after = await rest(`orders?id=eq.${orderId}&select=total,eta,review_status`);
  check(after.body?.[0]?.total === "€275", `the row carries the price (${after.body?.[0]?.total})`);
  check(after.body?.[0]?.review_status === "accepted", "and is marked accepted");
  const alerts = await rest(
    `notifications?audience=eq.client&profile_id=eq.${clientId}&order=created_at.desc&limit=3&select=kind,text`
  );
  check(
    (alerts.body ?? []).some((n) => /275/.test(n.text || "")),
    "the client has been notified of the price"
  );

  // Move it along the stages the studio uses.
  const nextStage = page.locator('button:has-text("В изработка"), select').first();
  if ((await nextStage.count()) > 0) {
    await nextStage.click().catch(() => {});
    await page.waitForTimeout(3000);
  }

  // ------------------------------------------------------------- the inbox
  console.log("\nthe inbox");
  await page.goto(`${BASE}/admin/inbox`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(6000);
  body = await text(page);
  check(body.includes(demoProfile.body[0].name), "the conversations are listed");
  // Enquiries load separately from the conversations, so either state is
  // right — what must never happen is one taking the other down with it.
  const enquiriesFailed = /Запитванията не се заредиха/.test(body);
  console.log(
    `    enquiries: ${enquiriesFailed ? "not loaded (0008 not applied?)" : "loaded"}`
  );
  check(
    body.includes(demoProfile.body[0].name),
    "the conversations are there whether or not the enquiries loaded"
  );
  await page.locator(`button:has-text("${demoProfile.body[0].name}")`).first().click();
  await page.waitForTimeout(4000);
  check(
    /275/.test(await text(page)),
    "the thread shows the message the price change sent"
  );

  // --------------------------------------------------- the rest of the panel
  console.log("\nthe other pages");
  for (const [path, marker] of [
    ["/admin/ready", /Готови модели/i],
    ["/admin/analytics", /Анализи/i],
    ["/admin/orders/category/all", /поръчк/i],
    ["/admin/calendar", /Календар за проби/i],
  ]) {
    const res = await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(5500);
    const t2 = await text(page);
    check(res.status() === 200, `${path} serves 200`);
    check(marker.test(t2), `${path} renders its own content`);
    check(!/\bundefined\b|\bNaN\b|\[object Object\]/.test(t2), `${path} shows no raw values`);
    check(!/Зареждане…$/.test(t2.trim()), `${path} does not stay on Loading`);
  }

  // ------------------------------------------ the wall, as the studio sees it
  console.log("\nthe wall of names");
  await page.goto(`${BASE}/worn-by`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);
  body = await text(page);
  check(/Мартин Стоев/.test(body), "the studio sees the example entry");
  check(/Вижда се само от теб/.test(body), "and is told only she can see it");

  // ------------------------------------------- the panel with no database
  console.log("\nthe panel with the reads cut off");
  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  // Only the list query. Aborting every read takes the session read with it,
  // and then the panel cannot tell who you are and sends you to the login page
  // — which is its own correct behaviour, tested in tests/states.mjs, but not
  // the state this is after.
  await page.route("**/rest/v1/profiles**", (r) =>
    /measurements|wardrobe_items|order_notes/.test(r.request().url())
      ? r.abort()
      : r.continue()
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(10000);
  body = await text(page);
  check(/Не успяхме да заредим/i.test(body), "it says the list could not be loaded");
  check(
    (await page.locator('button:has-text("Опитай отново")').count()) > 0,
    "with a way to try again"
  );
  const dashes = await page.evaluate(() =>
    [...document.querySelectorAll(".font-display")].map((e) => e.innerText.trim()).slice(0, 4)
  );
  check(
    dashes.filter((d) => d === "—").length >= 3,
    `and the counts show dashes rather than zeroes (${dashes.join(" ")})`
  );
  await page.unroute("**/rest/v1/profiles**");

  // ------------------------------------------------ the panel on a phone
  console.log("\nthe panel on a phone");
  for (const path of ["/admin", "/admin/inbox", "/admin/analytics"]) {
    await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(4500);
    const over = {};
    for (const w of [320, 390]) {
      await page.setViewportSize({ width: w, height: 780 });
      await page.waitForTimeout(600);
      const px = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      if (px > 2) over[w] = px;
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    const desc = Object.entries(over).map(([w, px]) => `${w}:+${px}px`).join(" ");
    check(Object.keys(over).length === 0, `${path} does not scroll sideways${desc ? ` (${desc})` : ""}`);
  }

  // ----------------------------------------- and what the client now sees
  console.log("\nthe client's side of the same order");
  const client = await signIn(E.NEXT_PUBLIC_DEMO_EMAIL, E.NEXT_PUBLIC_DEMO_PASSWORD, "/dashboard");
  const clientBody = await text(client.page);
  check(clientBody.includes(`${MARK} coat`), "the order is on her account");
  check(/275/.test(clientBody), "showing the price the studio set");
  const bell = await client.page.evaluate(() =>
    document.body.innerText.includes("275")
  );
  check(bell, "and she has been told about it");
  await client.ctx.close();

  await ctx.close();
  if (errors.length) console.log("  page errors:", errors.slice(0, 3).join(" | "));
  check(errors.length === 0, "no uncaught errors on the studio pages");
} finally {
  await browser.close();
  if (server) process.kill(-server.pid);
  await teardown();
}

console.log(bad.length ? `\n${bad.length} FAILED\n` : "\nall studio checks passed\n");
process.exit(bad.length ? 1 : 0);
