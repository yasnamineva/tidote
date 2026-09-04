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
const B = "http://localhost:3000";
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
    const res = await page.goto(B + path, { waitUntil:"networkidle" });
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
  await page.goto(B + "/login", { waitUntil:"networkidle" });
  check(await page.locator('a[href="/signup"]').count()>=1, "login offers Create an account");
  check(await page.locator('button:has-text("' + (lang==="bg"?"Забравена":"Forgot") + '")').count()>=1, "login offers a password reset");
  await page.goto(B + "/signup", { waitUntil:"networkidle" });
  check(await page.locator('a[href="/login"]').count()>=1, "signup links back to sign in");

  console.log(`[${lang}] behaviour with no backend`);
  await page.goto(B + "/signup", { waitUntil:"networkidle" });
  await page.fill("#name","Test Person"); await page.fill("#email","x@example.com"); await page.fill("#password","longenough1");
  await page.click('button[type="submit"]'); await page.waitForTimeout(1200);
  const sErr = (await page.locator('[role="alert"]').first().textContent() || "").trim();
  check(/SETUP\.md|база данни/.test(sErr), `signup says why, not "try again": "${sErr.slice(0,50)}"`);

  // minLength stops the browser submitting at all, which is better than our own
  // message — so what to assert is that it never got sent, not that we complained.
  await page.goto(B + "/signup", { waitUntil:"networkidle" });
  await page.fill("#name","T"); await page.fill("#email","x@example.com"); await page.fill("#password","short");
  await page.click('button[type="submit"]'); await page.waitForTimeout(500);
  const blocked = await page.evaluate(() => {
    const el = document.querySelector("#password");
    return { invalid: !el.checkValidity(), msg: el.validationMessage };
  });
  check(blocked.invalid, `short password blocked by the browser: "${blocked.msg.slice(0,45)}"`);

  await page.goto(B + "/login", { waitUntil:"networkidle" });
  await page.click(`button:has-text("${lang==="bg"?"Забравена":"Forgot"}")`);
  await page.waitForTimeout(700);
  const fErr = (await page.locator('[role="alert"]').first().textContent() || "").trim();
  check(fErr.length>0, `reset without an email asks for one: "${fErr.slice(0,45)}"`);

  const real = errs.filter(e => !e.includes("_vercel/insights"));
  check(real.length===0, `no console errors` + (real.length?`: ${real[0].slice(0,60)}`:""));
  await page.close();
}

// the new pages must not be behind the guard
console.log("\nguards unchanged");
{
  const page = await (await browser.newContext()).newPage();
  for (const [p, expect] of [["/signup","/signup"],["/reset-password","/reset-password"],["/dashboard","/login"],["/admin","/login"]]) {
    await page.goto(B + p, { waitUntil:"networkidle" });
    await page.waitForTimeout(1000);
    const landed = page.url().replace(B,"").split("?")[0];
    check(landed===expect, `${p} -> ${landed}`);
  }
}
console.log("\n" + (bad.length ? `${bad.length} PROBLEM(S)` : "ALL AUTH-FLOW CHECKS PASSED"));
await browser.close();
process.exit(bad.length?1:0);
