/**
 * Everything that paints where it should not, measured in the page.
 *
 * Lives in its own file because two suites need it: the public pages
 * (tests/layout.mjs) and the studio panel (tests/admin.mjs), which for a long
 * time was checked only for sideways scroll — the panel is where the studio
 * spends her working day and it had never been looked at for text printed
 * across other text.
 *
 * Passed to `page.evaluate`, so it must stay self-contained: no imports, no
 * closure over anything in this file.
 */
export function findCollisions() {
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

/**
 * Anything meant to be pressed that is under 30px tall, ignoring links inside
 * running text and counting an invisible `::before` hit area when there is one.
 * Also passed to `page.evaluate`.
 */
export function findSmallTargets() {
  const out = [];
  for (const el of document.querySelectorAll("button, a[href], summary, [role='button']")) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.pointerEvents === "none") continue;
    const before = getComputedStyle(el, "::before");
    const grown = before.position === "absolute" ? parseFloat(before.height) || 0 : 0;
    const height = Math.max(r.height, grown);
    const inline = cs.display === "inline" && el.closest("p,li,dd,figcaption,td");
    if (!inline && height < 30) {
      out.push(
        `${el.tagName.toLowerCase()} "${(el.innerText || "").trim().slice(0, 18)}" ${Math.round(height)}px`
      );
    }
  }
  return [...new Set(out)].slice(0, 5);
}
