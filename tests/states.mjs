/**
 * What every page does when the database does not answer.
 *
 * The four states were written into the portal in one pass (rework 9) and
 * reviewed, which is not the same as seen. This breaks the connection on
 * purpose — the reads, or one particular write — and checks that the screen
 * says so, offers a way to try again, and never claims a save that did not
 * happen.
 *
 * Reads go to the REST API, sessions to the auth API, so aborting one leaves
 * the other alone: that is how a signed-in page with no data is produced.
 *
 *   npm run test:states
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";

const PORT = process.env.PORT || 3123;
const BASE = process.env.BASE_URL || `http://localhost:${PORT}`;
const MARK = `STATE-${Date.now()}`;

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

const bad = [];
const check = (ok, m) => {
  console.log(`  ${ok ? "PASS" : "** FAIL **"}  ${m}`);
  if (!ok) bad.push(m);
};

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

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==",
  "base64"
);

const browser = await chromium.launch();

/**
 * Paths this run has put in the private bucket. Nothing here writes a database
 * row, so there is no row to delete them with — they are collected off the
 * upload requests and removed at the end.
 */
const uploaded = [];
function watchUploads(page) {
  page.on("request", (r) => {
    const m = /\/storage\/v1\/object\/client-photos\/(.+)$/.exec(r.url());
    if (m && r.method() === "POST") uploaded.push(decodeURIComponent(m[1]));
  });
}

/** A signed-in page, with the reads working. */
async function signedIn() {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("tidote_lang", "bg");
    } catch {}
  });
  const page = await ctx.newPage();
  watchUploads(page);
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('input[type="password"]', { timeout: 30000 });
  await page.fill('input[type="email"]', E.NEXT_PUBLIC_DEMO_EMAIL);
  await page.fill('input[type="password"]', E.NEXT_PUBLIC_DEMO_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/\/dashboard/, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(4000);
  return { ctx, page };
}

/** Is a retry button on screen, inside an alert? */
async function failureShown(page) {
  return page.evaluate(() => {
    const alerts = [...document.querySelectorAll('[role="alert"]')];
    return alerts.some(
      (a) => a.querySelector("button") && (a.innerText || "").trim().length > 20
    );
  });
}

// ---------------------------------------------------------- public: the rail
console.log("\nthe rail, with the database unreachable");
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("tidote_lang", "bg");
    } catch {}
  });
  const page = await ctx.newPage();
  await page.route("**/rest/v1/**", (r) => r.abort());
  await page.goto(`${BASE}/in-stock`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const text = () => page.evaluate(() => document.body.innerText);
  check(/Зареждане/.test(await text()), "it says it is loading first");
  await page.waitForTimeout(11000);
  const after = await text();
  check(/не успяхме|Не успяхме/i.test(after), "then that it could not load the rail");
  check(!/закачалката е празна/i.test(after), "and never that the rail is empty");
  check(
    (await page.locator('button:has-text("Опитай отново")').count()) > 0,
    "with a way to try again"
  );
  await ctx.close();
}

// ------------------------------------------------------ the client's account
console.log("\nthe account, with the reads cut off after sign-in");
{
  const { ctx, page } = await signedIn();
  check(page.url().includes("/dashboard"), "signed in");
  // Cut the reads, then make the page re-read.
  await page.route("**/rest/v1/**", (r) => r.abort());
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(9000);
  const body = await page.evaluate(() => document.body.innerText);
  check(!/Зареждане на профила/.test(body), "it does not sit on Loading for ever");
  check(!/Все още няма поръчки|No orders yet/i.test(body), "and does not say the account is empty");
  // Who you are is itself a read. With that refused the portal cannot tell a
  // client from the studio, so it sends you to the door — and has to say why,
  // because the session and the password are both fine.
  check(page.url().includes("/login"), "an unreadable profile sends you to the door");
  check(
    /не успяхме да се свържем с базата/i.test(body),
    "and the door explains itself rather than looking like a bad password"
  );
  check(
    !/Имейлът или паролата не са верни/i.test(body),
    "never blaming the password"
  );
  await ctx.close();
}

// ----------------------------------------------------------- saves that fail
console.log("\nsaves, with the write refused");
{
  const { ctx, page } = await signedIn();

  // Measurements. Load first, then block only the write.
  await page.waitForSelector("#chest", { timeout: 30000 });
  const original = await page.inputValue("#chest");
  await page.route("**/rest/v1/measurements**", (r) =>
    r.request().method() === "GET" ? r.continue() : r.abort()
  );
  await page.fill("#chest", "101");
  await page.locator('form:has(#chest) button[type="submit"]').first().click();
  await page.waitForTimeout(6000);
  const mBody = await page.evaluate(() => document.body.innerText);
  check(!/Мерките са запазени/.test(mBody), "measurements do not claim to have saved");
  check(/не се запази/i.test(mBody), "they say the save failed");
  check((await page.inputValue("#chest")) === "101", "and keep what was typed");
  await page.unroute("**/rest/v1/measurements**");
  await page.fill("#chest", original || "");
  await page.locator('form:has(#chest) button[type="submit"]').first().click();
  await page.waitForTimeout(3000);

  // Delivery details.
  await page.route("**/rest/v1/delivery_info**", (r) =>
    r.request().method() === "GET" ? r.continue() : r.abort()
  );
  await page.locator("#delivery").scrollIntoViewIfNeeded();
  const city = page.locator('#delivery input').nth(1);
  await city.fill(`${MARK}-city`);
  await page.locator('#delivery button[type="submit"]').first().click();
  await page.waitForTimeout(6000);
  const dBody = await page.evaluate(
    () => document.getElementById("delivery").innerText
  );
  check(/не се запази/i.test(dBody), "delivery details say the save failed");
  check(!/Запазено|Данните са запазени/i.test(dBody), "and do not say saved");
  await page.unroute("**/rest/v1/delivery_info**");

  // An order that cannot be inserted.
  await page.goto(`${BASE}/dashboard/new-order`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#piece", { timeout: 30000 });
  await page.route("**/rest/v1/orders**", (r) =>
    r.request().method() === "GET" ? r.continue() : r.abort()
  );
  await page.fill("#piece", `${MARK} jacket`);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(6000);
  check(page.url().includes("/new-order"), "a failed order does not navigate away");
  check(await page.locator('[role="alert"]').count() > 0, "and says it did not send");
  check(
    (await page.inputValue("#piece")) === `${MARK} jacket`,
    "keeping the description that was typed"
  );
  await page.unroute("**/rest/v1/orders**");
  await ctx.close();
}

// --------------------------------------------------------------- bad uploads
console.log("\nfiles that cannot be used");
{
  const { ctx, page } = await signedIn();
  await page.goto(`${BASE}/dashboard/new-order`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#piece", { timeout: 30000 });
  const warned = () =>
    page.evaluate(() => document.querySelector("form").innerText);

  // Not an image at all.
  await page.setInputFiles('input[type="file"]', {
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("this is not a photograph"),
  });
  await page.waitForTimeout(4000);
  check(/notes\.txt/.test(await warned()), "a text file is refused by name");
  check(
    (await page.locator('form img').count()) === 0,
    "and nothing is added to the order"
  );

  // Over the 20MB ceiling.
  await page.setInputFiles('input[type="file"]', {
    name: "huge.png",
    mimeType: "image/png",
    buffer: Buffer.alloc(21 * 1024 * 1024, 1),
  });
  await page.waitForTimeout(5000);
  check(/huge\.png/.test(await warned()), "an oversized file is refused by name");

  // A real photograph, but storage refuses it.
  await page.route("**/storage/v1/**", (r) => r.abort());
  await page.setInputFiles('input[type="file"]', {
    name: "fine.png",
    mimeType: "image/png",
    buffer: PNG,
  });
  await page.waitForTimeout(6000);
  const afterUpload = await warned();
  check(
    /не се качи|did not upload/i.test(afterUpload),
    "a failed upload says so rather than failing silently"
  );
  check(
    (await page.locator("form img").count()) === 0,
    "and no half-attached photo is left on the form"
  );
  await page.unroute("**/storage/v1/**");
  await ctx.close();
}

// ------------------------------------------ the studio door, from outside
console.log("\nthe studio setup page, to someone who should not get in");
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("tidote_lang", "bg");
    } catch {}
  });
  const page = await ctx.newPage();

  const res = await page.request.post(`${BASE}/api/studio/claim`, {
    data: {
      email: `nobody-${Date.now()}@tidote.invalid`,
      code: "not the code at all",
      password: "long-enough-password",
    },
  });
  const body = await res.json().catch(() => ({}));
  console.log(`    route answered ${res.status()} ${JSON.stringify(body)}`);
  // `refused` once 0009 is applied, `not_configured` before that. Either is a
  // code this page can put into her language; neither is Postgres's own words,
  // and neither says whether the address is on the allow-list.
  check(
    ["refused", "not_configured"].includes(body.code),
    "a stranger with a wrong code is refused by code, not by database error"
  );
  check(res.status() !== 201, "and no account is created");
  check(
    !JSON.stringify(body).includes("admin_emails"),
    "without naming the allow-list"
  );

  const short = await page.request.post(`${BASE}/api/studio/claim`, {
    data: { email: "someone@tidote.invalid", code: "a code", password: "short" },
  });
  check((await short.json()).code === "bad_input", "a short password is refused before anything else");

  // And the page itself renders, in both languages, with its three fields.
  await page.goto(`${BASE}/studio-setup`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  check(
    (await page.locator("#studio-email").count()) === 1 &&
      (await page.locator("#studio-code").count()) === 1 &&
      (await page.locator("#studio-password").count()) === 1,
    "the setup page has an address, a code and a password"
  );
  const seen = await page.evaluate(() => document.body.innerText);
  check(
    !/admin_emails|verify_studio_code|sb_secret/i.test(seen),
    "and gives nothing away about how the door works"
  );
  await ctx.close();
}

// ------------------------------------------------- where a photograph lands
console.log("\na photograph, and where it actually goes");
{
  const { ctx, page } = await signedIn();
  const storage = [];
  page.on("request", (r) => {
    if (r.url().includes("/storage/v1/object/client-photos")) storage.push(r.method());
  });
  await page.goto(`${BASE}/dashboard/new-order`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#piece", { timeout: 30000 });
  await page.setInputFiles('input[type="file"]', {
    name: "fine.png",
    mimeType: "image/png",
    buffer: PNG,
  });
  await page.waitForTimeout(8000);
  // It used to end up base64 inside the database row: `importPhotos` produces
  // data URLs, and the upload loop treated a data URL as already stored.
  check(storage.includes("POST"), "the file is uploaded to the private bucket");
  check(
    (await page.locator("form img").count()) === 1,
    "and shows on the form once it is up"
  );
  await ctx.close();
}

// -------------------------------------------------- the enquiry, with no table
console.log("\nan enquiry when the table is not there");
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("tidote_lang", "bg");
    } catch {}
  });
  const page = await ctx.newPage();
  const res = await page.request.post(`${BASE}/api/enquiries`, {
    data: {
      name: `${MARK} probe`,
      email: "probe@tidote.invalid",
      message: "A state test, not a real enquiry.",
      lang: "bg",
    },
  });
  const body = await res.json().catch(() => ({}));
  console.log(`    route answered ${res.status()} ${JSON.stringify(body)}`);
  check(
    res.status() === 201 || typeof body.code === "string",
    "the route answers with a code, not a database sentence"
  );
  check(
    !JSON.stringify(body).includes("schema cache"),
    "and never leaks the schema error to the caller"
  );

  // The two rejections a visitor can actually cause.
  const noName = await page.request.post(`${BASE}/api/enquiries`, {
    data: { name: "", message: "", lang: "bg" },
  });
  check(
    (await noName.json()).code === "missing_fields",
    "an empty form is refused with missing_fields"
  );
  const noContact = await page.request.post(`${BASE}/api/enquiries`, {
    data: { name: "A", message: "B", lang: "bg" },
  });
  check(
    (await noContact.json()).code === "no_contact",
    "and one with no way to reply with no_contact"
  );
  await ctx.close();
}

await browser.close();

// ---------------------------------------------------------------- teardown
if (uploaded.length > 0) {
  const key = E.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    console.log(`\nteardown: no service key — ${uploaded.length} file(s) left in client-photos`);
  } else {
    const res = await fetch(`${E.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/client-photos`, {
      method: "DELETE",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes: uploaded }),
    });
    console.log(`\nteardown: removed ${uploaded.length} uploaded file(s)${res.ok ? "" : ` (HTTP ${res.status})`}`);
    if (!res.ok) bad.push("teardown left files in the bucket");
  }
}

if (server) process.kill(-server.pid);
console.log(bad.length ? `\n${bad.length} FAILED\n` : "\nall state checks passed\n");
process.exit(bad.length ? 1 : 0);
