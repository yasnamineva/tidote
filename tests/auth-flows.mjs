/**
 * The three account pages, in both languages, against a running dev server.
 *
 * These do not need a database: what they check is that the pages render, the
 * cross-links between them exist, the guards still let them through, and that
 * an unconfigured backend produces a message naming the real cause rather than
 * blaming the person's password.
 *
 *   npm run dev            # in another terminal
 *   npm run test:auth
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const B = process.env.BASE_URL || "http://localhost:3000";

/** Whether this checkout has a database behind it, which changes what is true. */
const { DEMO_EMAIL, CONFIGURED } = (() => {
  try {
    const env = {};
    for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
      const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
      if (m) env[m[1]] = m[2];
    }
    return {
      DEMO_EMAIL: env.NEXT_PUBLIC_DEMO_EMAIL || "x@example.com",
      CONFIGURED: Boolean(env.NEXT_PUBLIC_SUPABASE_URL),
    };
  } catch {
    return { DEMO_EMAIL: "x@example.com", CONFIGURED: false };
  }
})();
/**
 * Go somewhere and let it settle.
 *
 * These checks used to navigate with `networkidle`, which waits for a quiet
 * network — something a page that polls for notifications never provides. It
 * passed by luck until it timed out. `domcontentloaded` returns too early for
 * links and animations, so the settle is explicit now rather than a side
 * effect of waiting for the wrong thing.
 */
async function go(page, path) {
  await page.goto(B + path, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1800);
}

const browser = await chromium.launch();
const bad = [];
const check = (ok, m) => { console.log(`  ${ok ? "PASS" : "** FAIL **"}  ${m}`); if (!ok) bad.push(m); };

for (const lang of ["en","bg"]) {
  const page = await (await browser.newContext({ viewport:{width:1280,height:900} })).newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(e.message));
  page.on("console", m => m.type()==="error" && errs.push(m.text()));
  await page.goto(B + "/login");
  await page.evaluate(l => localStorage.setItem("tidote_lang", l), lang);

  console.log(`\n[${lang}] the three account pages`);
  for (const [path, marker] of [["/login","#password"],["/signup","#name"],["/reset-password",null]]) {
    const res = await page.goto(B + path, { waitUntil:"domcontentloaded" });
    await page.waitForTimeout(1200);
    await page.waitForTimeout(700);
    check(res.status()===200, `${path} serves 200`);
    const chars = await page.evaluate(() => document.body.innerText.trim().length);
    check(chars > 150, `${path} renders (${chars} chars)`);
    if (marker) check(await page.locator(marker).count()===1, `${path} has its form`);
    const over = [];
    for (const w of [320,375,768,1280]) {
      await page.setViewportSize({width:w,height:850}); await page.waitForTimeout(200);
      const o = await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
      if (o>0) over.push(`${w}:+${o}`);
    }
    check(over.length===0, `${path} no overflow` + (over.length?` (${over.join(" ")})`:""));
    await page.setViewportSize({width:1280,height:900});
  }

  console.log(`[${lang}] cross-links`);
  await go(page, "/login");
  check(await page.locator('a[href="/signup"]').count()>=1, "login offers Create an account");
  check(await page.locator('button:has-text("' + (lang==="bg"?"Забравена":"Forgot") + '")').count()>=1, "login offers a password reset");
  await go(page, "/signup");
  check(await page.locator('a[href="/login"]').count()>=1, "signup links back to sign in");

  // Registering an address that already has an account.
  //
  // This assertion used to be the opposite. Supabase answers such a signup
  // exactly as it answers a new one and sends no mail, so that the form cannot
  // be used to discover who is registered, and this suite checked that the
  // silence held. It held — and the owner of the site sat watching an inbox
  // for a message that was never sent.
  //
  // The atelier chose the other side of that trade: say so. The cost is that
  // someone can now learn whether a given address has an account at a small
  // studio; the benefit is that nobody is stuck at that dead end. So what is
  // checked here now is that the form *does* tell you, and offers the two
  // things you actually want next.
  console.log(`[${lang}] registering an address that already has an account`);
  await go(page, "/signup");
  await page.fill("#name","Test Person");
  await page.fill("#email", CONFIGURED ? DEMO_EMAIL : "x@example.com");
  // Meets the rules the form now shows: length, a digit, a symbol.
  await page.fill("#password","longenough1!");
  await page.fill("#confirm","longenough1!");
  await page.click('button[type="submit"]'); await page.waitForTimeout(4000);
  const sErr = (await page.locator('[role="alert"]').first().textContent() || "").trim();
  const shown = await page.evaluate(() => document.body.innerText);

  if (CONFIGURED) {
    check(
      /вече има профил|already has an account/i.test(sErr),
      `it says the address is taken: "${sErr.slice(0, 48)}"`
    );
    check(
      !/Проверете .*за връзка|Check .* for a link/i.test(shown),
      "and does not send you to an inbox with nothing in it"
    );
    check(
      (await page.locator('a[href="/login"]').count()) > 0 &&
        (await page.locator('a[href="/reset-password"]').count()) > 0,
      "offering both a sign-in and a password reset"
    );
  } else {
    check(/SETUP\.md|база данни/.test(sErr), `signup names the real cause: "${sErr.slice(0,60)}"`);
  }

  // minLength stops the browser submitting at all, which is better than our own
  // message — so what to assert is that it never got sent, not that we complained.
  await go(page, "/signup");
  // A password that is long enough but has neither a digit nor a symbol is
  // refused by the rules rather than by the browser, and the list under the
  // field says which one is missing before the button is ever pressed.
  await go(page, "/signup");
  await page.fill("#password","onlyletters");
  await page.waitForTimeout(400);
  const ticks = await page.evaluate(() =>
    [...document.querySelectorAll("li")]
      .filter((li) => /\u2713|\u00b7/.test(li.innerText))
      .map((li) => li.innerText.trim().slice(0, 2))
  );
  check(
    ticks.filter((t) => t.startsWith("\u2713")).length === 1,
    `the rule list ticks only what is met (${ticks.join(" ")})`
  );
  check(
    (await page.locator('button[aria-pressed]').count()) >= 1,
    "and the password can be shown"
  );

  await go(page, "/signup");
  await page.fill("#name","T"); await page.fill("#email","x@example.com"); await page.fill("#password","short");
  await page.click('button[type="submit"]'); await page.waitForTimeout(500);
  const blocked = await page.evaluate(() => {
    const el = document.querySelector("#password");
    return { invalid: !el.checkValidity(), msg: el.validationMessage };
  });
  check(blocked.invalid, `short password blocked by the browser: "${blocked.msg.slice(0,45)}"`);

  await go(page, "/login");
  await page.click(`button:has-text("${lang==="bg"?"Забравена":"Forgot"}")`);
  await page.waitForTimeout(700);
  const fErr = (await page.locator('[role="alert"]').first().textContent() || "").trim();
  check(fErr.length>0, `reset without an email asks for one: "${fErr.slice(0,45)}"`);

  // Vercel's analytics script is not served outside Vercel, so running this
  // locally always logs a 404 for it and a MIME complaint about the 404 page.
  // Neither says anything about the pages under test.
  const real = errs.filter(
    (e) =>
      !e.includes("_vercel/insights") &&
      !/Failed to load resource.*404/.test(e) &&
      !/Refused to execute script/.test(e)
  );
  check(real.length===0, `no console errors` + (real.length?`: ${real[0].slice(0,60)}`:""));
  await page.close();
}

// the new pages must not be behind the guard
console.log("\nguards unchanged");
{
  const page = await (await browser.newContext()).newPage();
  for (const [p, expect] of [["/signup","/signup"],["/reset-password","/reset-password"],["/dashboard","/login"],["/admin","/login"]]) {
    // `domcontentloaded` and then a beat, rather than `networkidle`: a page
    // that polls for notifications never goes idle, so waiting for that was
    // waiting for something that does not happen.
    await go(page, p);
    await page.waitForTimeout(2500);
    const landed = page.url().replace(B,"").split("?")[0];
    check(landed===expect, `${p} -> ${landed}`);
  }
}
console.log("\n" + (bad.length ? `${bad.length} PROBLEM(S)` : "ALL AUTH-FLOW CHECKS PASSED"));
await browser.close();
process.exit(bad.length?1:0);
