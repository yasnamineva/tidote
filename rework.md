# Tidote Atelier — Priority Fixes

## Goal

Improve the existing site without redesigning the brand.

Focus only on the changes that will have the biggest impact on:

1. Conversion
2. Trust
3. Product clarity
4. Reliability

Do not over-engineer or redesign things that already work.

---

## 1. Fix the buying journey — highest priority

Currently the main CTAs push new visitors toward Login before they've properly understood what they're buying.

Change the flow to:

```text
Homepage
→ Explore pieces
→ Product/category
→ Understand price + process
→ Buy / Customize / Commission
→ Create account when needed
```

A visitor should be able to browse and understand the products **without logging in**.

Authentication should be required only when necessary for things such as:

* placing an order
* saving measurements
* uploading private references
* tracking an order
* booking a fitting

Make the primary CTAs explicit:

* `Explore pieces`
* `View piece`
* `Commission a piece`
* `Shop in stock`

Avoid vague CTAs like `Get Yours Now` when they don't clearly communicate what happens next.

---

## 2. Make the offer and pricing much clearer

The site currently looks good but doesn't answer the basic buying questions quickly enough.

For every product/category, show where possible:

* Product name
* Price or starting price
* What the customer gets
* Made-to-measure vs in-stock
* Approximate production time
* Fitting information
* Clear CTA

Do **not invent prices or policies**. Use the actual values from the code/database/business configuration.

If pricing or production times aren't currently defined, make them easy to configure rather than hardcoding them in multiple places.

---

## 3. Improve the homepage

Keep the existing visual identity, but make the proposition immediately understandable.

The first screen should communicate something close to:

> **Made-to-measure streetwear, built in Sofia.**

Then briefly explain what that means.

The homepage should quickly lead into three clear choices:

### In Stock

Finished pieces available now.

### Custom

Start with an existing piece and personalize it.

### Bespoke / Commission

Bring an idea and have the atelier make it for you.

Use the existing brand voice around this rather than replacing it.

The goal is **clarity first, personality second**.

---

## 4. Fix `/in-stock`

Investigate the current `Loading...` state in a real browser.

Make sure the page has proper:

* Loading state
* Loaded state
* Empty state
* Error state

It must never remain stuck on `Loading...`.

Products should show:

* Image
* Name
* Price
* Availability
* CTA

If there are genuinely no products, explain that clearly and provide a useful next action.

---

## 5. Remove fake/placeholder social proof

Remove the fictional/example customer from `Worn By`.

Do not display:

* fake testimonials
* example customers presented as real
* placeholder reviews

If there are not yet enough real customers, hide the Worn By section/page.

Real customer content can be added later.

---

## 6. Make the made-to-measure process obvious

Add a concise explanation:

```text
Choose a piece
→ Tell us what you want
→ Measurements
→ We make it
→ Fitting
→ Finished garment
```

Also answer the three most important questions:

* How long does it take?
* How does fitting work?
* What happens if the fit needs adjustment?

Use actual business policies; don't invent them.

---

## 7. Add trust through the atelier itself

Strengthen the About/process content with real:

* people
* atelier/studio
* materials
* construction
* fittings
* finished garments

The current concept says "made-to-measure" repeatedly. The website should **show evidence of that craftsmanship**.

A few strong process photographs are more valuable than additional marketing copy.

---

## 8. Basic authenticated workflow QA

Before considering the work finished, test the real application, not just the public pages.

At minimum test:

### Authentication

* Sign up
* Login
* Wrong password
* Password reset
* Logout
* Refresh while logged in

### Orders

* Create order
* Submit order
* Refresh during process
* Prevent duplicate submission
* Verify order persists

### Measurements

* Save
* Edit
* Reload
* Validate invalid/empty values

### Uploads

* Upload image
* Remove image
* Large/invalid file
* Upload failure

### Privacy

Verify that User A **cannot access User B's**:

* orders
* measurements
* uploaded images
* personal information

Test this at the API/database/storage level, not just by hiding UI elements.

---

## 9. Add proper error/empty states

Every data-dependent page should handle:

```text
Loading
Success
Empty
Error
```

Never expose:

* `undefined`
* `null`
* `NaN`
* permanent spinners
* raw API errors

Errors should tell the customer what happened and provide a retry/recovery action.

---

## 10. Mobile pass

Before finishing, test the main journey on mobile:

```text
Homepage
→ Product
→ Commission/order
→ Login
→ Measurements
→ Upload
→ Order
```

Check especially:

* navigation
* buttons
* forms
* image galleries
* file uploads
* keyboard behavior
* horizontal overflow
* sticky elements covering content

---

# Do NOT do

Do not:

* completely redesign the site
* replace the visual identity
* add unnecessary animations
* turn it into a generic Shopify-style store
* add fake content
* invent prices/policies
* build unnecessary new infrastructure

Keep the existing aesthetic.

---

# Priority

Implement in this order:

### P0

1. Fix buying/login flow
2. Add product/price clarity
3. Fix `/in-stock`
4. Remove fake Worn By content
5. Test authenticated/privacy workflows

### P1

6. Improve homepage hierarchy
7. Explain made-to-measure process
8. Strengthen craft/atelier content
9. Add proper error/empty states
10. Mobile QA

The objective is simple:

> A new visitor should understand what Tidote makes, what it costs, why it is worth it, and exactly how to get one — without unnecessary friction.
