/**
 * Things that must agree with each other, checked without a browser.
 *
 * `npm run test:copy`
 */
import { readFileSync } from "node:fs";

const bad = [];
const check = (ok, m) => {
  console.log(`  ${ok ? "PASS" : "** FAIL **"}  ${m}`);
  if (!ok) bad.push(m);
};

const translations = readFileSync(new URL("../src/lib/translations.ts", import.meta.url), "utf8");
const mail = readFileSync(new URL("../src/lib/notification-mail.ts", import.meta.url), "utf8");

// The order stages exist twice: as `status.*` for the screen, and inside the
// mail renderer, which cannot reuse them because it names them in the reader's
// language rather than the writer's. Two lists that must not drift.
const onScreen = [...translations.matchAll(/"status\.([a-z_]+)":/g)].map((m) => m[1]);
const stages = [...new Set(onScreen)];
const inMail = [...mail.matchAll(/^\s{4}([a-z_]+): "/gm)].map((m) => m[1]);

console.log("\nthe order stages");
for (const stage of stages) {
  check(inMail.includes(stage), `"${stage}" is named in the email too`);
}
for (const stage of [...new Set(inMail)]) {
  if (["bg", "en"].includes(stage)) continue;
  check(stages.includes(stage), `"${stage}" in the email is a real stage`);
}

// Every language the site speaks must render every mail string.
console.log("\nboth languages");
const langs = ["bg", "en"];
for (const lang of langs) {
  check(new RegExp(`\\n  ${lang}: \\{`).test(mail), `the mail renderer speaks ${lang}`);
}

console.log(bad.length ? `\n${bad.length} FAILED\n` : "\nthe copy agrees with itself\n");
process.exit(bad.length ? 1 : 0);
