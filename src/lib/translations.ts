export type Lang = "en" | "bg";

export const LANGS: Lang[] = ["en", "bg"];

/** Shared with the pre-hydration snippet in the root layout. */
export const LANG_KEY = "tidote_lang";

type Dict = Record<string, string>;

const en: Dict = {
  // chrome / nav
  "header.tagline": "Made to order · Sofia, BG",
  "nav.casual": "Casual",
  "nav.sports": "Sports",
  "nav.how": "How It Works",
  "nav.about": "About",
  "nav.gallery": "Gallery",
  "nav.custom": "Custom Pieces",
  "nav.inStock": "In Stock",
  "header.login": "Login / Track Order",
  "header.account": "Account",
  "header.studioAdmin": "Studio",

  // footer
  "footer.tagline":
    "The anTIDOTE to mediocrity. Unique streetstyle to match your main character energy.",
  "footer.explore": "Explore",
  "footer.shop": "Shop",
  "footer.connect": "Connect",
  "footer.rights": "© {year} Tidote Atelier. All rights reserved.",
  "footer.privacy": "Privacy Policy",

  // 404
  "nf.eyebrow": "Error 404",
  "nf.title": "This piece doesn't exist",
  "nf.body":
    "The page you're after has been moved, renamed, or never existed. The rest of the atelier is still here.",
  "nf.home": "Back to home",
  "nf.browse": "Browse the collection",

  // hero
  "hero.tagline":
    "The anTIDOTE to mediocrity — made-to-measure streetwear cut for your main character energy.",
  "hero.cta": "Get Yours Now",
  "hero.scroll": "Scroll",

  // shop tiles
  "shop.getYours": "Get Yours Now",
  "shop.viewLookbook": "View the lookbook",
  "cat.casual.title": "Casual",
  "cat.casual.copy": "Relaxed hoodies, denim, and layered everyday basics.",
  "cat.sports.title": "Sports",
  "cat.sports.copy": "Track jackets, windbreakers, technical athletic fits.",

  // category pages
  "cat.casual.eyebrow": "Casual",
  "cat.casual.pageTitle": "EVERYDAY EDGE",
  "cat.casual.blurb":
    "Relaxed hoodies, denim, and layered everyday basics — streetwear built for the everyday, cut and finished to made-to-measure standard.",
  "cat.casual.piecesTitle": "Casual Pieces",
  "cat.sports.eyebrow": "Sports",
  "cat.sports.pageTitle": "SPORTSWEAR",
  "cat.sports.blurb":
    "Track jackets, windbreakers, and technical fits — athletic silhouettes reworked with the same made-to-measure precision as everything else in the atelier.",
  "cat.sports.piecesTitle": "Sports Pieces",
  "catpage.lookbook": "The Lookbook",
  "catpage.follow": "Follow",

  // in stock (public rail)
  "instock.eyebrow": "Ready to wear",
  "instock.pageTitle": "IN STOCK",
  "instock.blurb":
    "Finished pieces, already cut and sewn in the Sofia studio. One of each, in the size listed \u2014 when it is gone, it is gone.",
  "instock.railTitle": "On the Rail",
  "instock.count": "{n} pieces",
  "instock.countOne": "1 piece",
  "instock.reserved": "Reserved",
  "instock.available": "Available",
  "instock.priceOnRequest": "Price on request",
  "instock.ask": "Enquire",
  "instock.countUnknown": "Could not load",
  "instock.errorTitle": "We could not load the rail.",
  "instock.errorSub":
    "Something went wrong between here and the studio — this is not the same as there being nothing in stock. Try again, or just ask us what is on the rail.",
  "instock.empty": "The rail is empty right now.",
  "instock.emptySub":
    "Everything here started as a commission. Tell us what you want and we will cut it for you.",
  "instock.commissionTitle": "Not your size?",
  "instock.commissionCopy":
    "Every piece the studio makes is cut to measure. Start a commission and we will build it to yours.",
  "instock.commissionCta": "Start a commission",
  "instock.lookbook": "See the lookbook",

  // buying journey — explicit CTAs, and the facts a buyer needs first
  "cta.explore": "Explore pieces",
  "cta.viewPieces": "View pieces",
  "cta.commission": "Commission a piece",
  "cta.shopInStock": "Shop in stock",
  "cta.browseFree": "No account needed to look around.",
  "cta.signInLater": "You sign in when you place the order.",

  "hero.prop": "Made-to-measure streetwear, built in Sofia.",
  "hero.propSub":
    "Every piece is cut to your own measurements in our studio. Nothing here is mass-produced, and nothing is made twice.",

  "choose.title": "Three ways to get one",
  "choose.sub":
    "Browse all of it without an account. You only sign in when there is an order to place.",
  "choose.stock.title": "In Stock",
  "choose.stock.copy":
    "Finished pieces, ready to take today. One of each, in the size listed.",
  "choose.custom.title": "Custom",
  "choose.custom.copy":
    "Start from a piece in the lookbook and have it cut to your measurements.",
  "choose.bespoke.title": "Bespoke",
  "choose.bespoke.copy":
    "Bring an idea the lookbook does not have, and the atelier makes it.",

  "fact.madeToMeasure": "Made to measure",
  "fact.inStockNow": "In stock now",
  "fact.readyToday": "Ready today",
  "fact.lead": "{min}–{max} working days",
  "fact.fittings": "{n} fittings included",
  "fact.adjust": "Adjustments free for {n} days",
  "fact.from": "from {price}",
  "fact.quoted": "Priced on enquiry",

  // How a commission works, and the three questions that decide it. The
  // "*Unset" answers describe only what the site actually does; fill the
  // figures into lib/offer.ts and the exact terms replace them.
  "terms.eyebrow": "Made to measure",
  "terms.title": "How a commission works",
  "flow.1": "Choose a piece",
  "flow.2": "Tell us what you want",
  "flow.3": "Measurements",
  "flow.4": "We make it",
  "flow.5": "Fitting",
  "flow.6": "Finished garment",
  "terms.q.lead": "How long does it take?",
  "terms.a.lead":
    "{min}\u2013{max} working days from the moment you accept the quote.",
  "terms.a.leadUnset":
    "It depends on the piece, so you get the date together with the quote \u2014 before you commit to anything. Your order page then shows where it has got to.",
  "terms.q.fitting": "How does the fitting work?",
  "terms.a.fitting":
    "{n} fittings at the atelier in Sofia are part of the price. When the piece is ready you pick a slot from the studio\u2019s calendar in your account.",
  "terms.a.fittingUnset":
    "When the piece is ready you are notified and you pick a fitting slot at the atelier in Sofia, from the studio\u2019s own calendar in your account.",
  "terms.q.adjust": "What if the fit is not right?",
  "terms.a.adjust":
    "Adjustments are made at no charge for {n} days after you receive the piece. Write to us from your account and we arrange it.",
  "terms.a.adjustUnset":
    "That is what the fitting is for: it is adjusted at the atelier before it goes anywhere. Anything you notice later, write to us from your account and we will tell you what can be done.",
  // enquiries
  "enq.title": "Ask the atelier",
  "enq.sub": "No account needed — we answer by email or telephone.",
  "enq.about": "About {piece}. No account needed.",
  "enq.name": "Your name",
  "enq.email": "Email",
  "enq.phone": "Telephone",
  "enq.message": "What would you like to know?",
  "enq.send": "Send enquiry",
  "enq.sending": "Sending…",
  "enq.sent": "Sent.",
  "enq.sentSub": "The atelier has it and will come back to you.",
  "enq.failed": "That did not send. Try again, or write to support@tidoteatelier.com.",
  "enq.needContact": "Leave an email address or a telephone number, so we can answer.",
  "enq.needBoth": "A name and a message, so we know who is asking and what for.",
  "enq.tooMany":
    "That is a lot of enquiries from one place. Wait a few minutes, or write to support@tidoteatelier.com.",
  "enq.privacy":
    "We use what you write here only to answer you. See the Privacy Policy.",
  "enqadmin.open": "Enquiries waiting ({n})",
  "enqadmin.done": "Mark answered",
  "enqadmin.failedTitle": "Enquiries could not be loaded.",
  "enqadmin.failedSub":
    "Your client conversations below are unaffected. If this is the first time you have opened this page, the enquiries table may not have been created in the database yet.",

  // worn by
  "nav.wornBy": "Worn By",
  "worn.eyebrow": "People who chose us",
  "worn.pageTitle": "WORN BY",
  "worn.blurb":
    "The people who chose to have it made for them, and let us say so.",
  "worn.empty": "This wall is still being hung.",
  "worn.emptySub":
    "The pieces are out there. The names go up here as their owners agree to it.",
  "worn.emptyCta": "Start a commission",
  "worn.wearing": "Wearing",
  "worn.example": "Example entry",
  "worn.exampleNote":
    "An invented entry, here to show how a real one will look. It goes when the first real name arrives.",
  "worn.studioOnly":
    "Visible only to you. Visitors see an empty wall until a real name is added — an invented endorsement is not something we show them.",
  "shop.inStockCta": "See what's in stock",
  "shop.inStockCopy":
    "Not everything has to be waited for \u2014 some pieces are finished and on the rail today.",

  // process
  "home.process.title": "How a Piece Comes Together",
  "process.1.title": "Design",
  "process.1.copy":
    "Every silhouette starts as a sketch pulled from street reference and rebuilt for movement.",
  "process.2.title": "Handcraft",
  "process.2.copy":
    "Cut, sewn, and finished in-house — no mass factory lines, no shortcuts.",
  "process.3.title": "Fit",
  "process.3.copy":
    "Made-to-measure clients get pieces built around their own tracked measurements.",
  "process.4.title": "Deliver",
  "process.4.copy":
    "Small batches, tracked from the atelier floor to your door.",

  // journey
  "home.journey.eyebrow": "From First Fitting to Final Piece",
  "home.journey.title": "Your Made-to-Measure Journey",
  "home.journey.cta": "Start Your Order",
  "journey.1.short": "Measurements",
  "journey.2.short": "Orders",
  "journey.3.short": "Try on",
  "journey.4.short": "Delivery",
  "journey.1.title": "Take & Update Measurements",
  "journey.1.copy":
    "Log your measurements so every made-to-measure piece is cut to fit.",
  "journey.2.title": "Place an Order",
  "journey.2.copy":
    "Pick a category, describe the piece, and attach reference photos if you like.",
  "journey.3.title": "Come for a Fitting",
  "journey.3.copy":
    "Once your piece is ready we'll notify you — book a fitting slot that works.",
  "journey.4.title": "Add Delivery Info",
  "journey.4.copy":
    "Tell us where to send the finished piece, or arrange pickup at the atelier.",

  // about
  "about.eyebrow": "About Us",
  "about.headline": "The anTIDOTE to mediocrity",
  "about.copy":
    "Tidote Atelier is a Sofia-based menswear house building unique, unrepeatable streetwear for men who refuse to blend in. Every collection reworks street culture through a made-to-order lens — meaning what you wear was actually made for you.",

  // Four checkable specifics, in place of another paragraph about care.
  "proof.eyebrow": "Inside the atelier",
  "proof.title": "Where it is made",
  "proof.sofia.title": "One atelier, in Sofia",
  "proof.sofia.copy":
    "Everything is made in the same studio, and that is where the fittings happen too.",
  "proof.inHouse.title": "Cut and sewn here",
  "proof.inHouse.copy":
    "Patterns, cutting and sewing are done in-house — nothing is sent out to a factory.",
  "proof.oneOff.title": "One garment at a time",
  "proof.oneOff.copy":
    "A commission is cut to your measurements, so it is made once and fits one person.",
  "proof.fitting.title": "Fitted in person",
  "proof.fitting.copy":
    "You try the piece on before it is finished, and it is corrected while it is still on the stand.",

  // gallery
  "gallery.eyebrow": "Straight From Instagram",
  "gallery.follow": "Follow",

  // login
  "login.eyebrow": "Client Access",
  "login.title": "LOGIN TO TRACK YOUR ORDER",
  "login.sessionUnreadable":
    "You are still signed in, but we could not reach the database to read your account. Nothing is wrong with your password — try again in a moment.",
  "login.email": "Email",
  "login.password": "Password",
  "login.submit": "Login",
  "login.submitting": "Signing in…",
  "login.noAccount": "First time here?",
  "login.createOne": "Create an account",

  "signup.eyebrow": "New here",
  "signup.title": "Create your account",
  "signup.name": "Your name",
  "signup.namePlaceholder": "e.g. Dimitar Kolev",
  "signup.submit": "Create account",
  "signup.submitting": "Creating…",
  "signup.passwordHint": "At least 8 characters.",
  "signup.shortPassword": "Use at least 8 characters.",
  "signup.taken": "That email already has an account. Try signing in instead.",
  "signup.failed": "Could not create the account. Please try again.",
  "signup.rateLimited":
    "Too many registrations have been attempted from here in the last hour, so the confirmation email could not be sent. Try again later, or write to support@tidoteatelier.com and we will set the account up for you.",

  // Setting up the studio account. The code is set once in the database with
  // set_studio_code(); see supabase/migrations/0009_studio_claim.sql.
  "studio.eyebrow": "Studio",
  "studio.title": "SET UP THE STUDIO ACCOUNT",
  "studio.blurb":
    "For the atelier's own account. The address has to be on the studio list in the database — then the password below is yours to choose, and nothing is emailed.",
  "studio.newPassword": "Your password",
  "studio.repeatPassword": "Your password again",
  "studio.submit": "Create the studio account",
  "studio.mismatch": "The two passwords are not the same.",
  "studio.refused":
    "That address does not open anything. It has to be on the studio list in the database, and it must not already have an account.",
  "studio.exists":
    "There is already an account for that address. Sign in with it, or clear claimed_at on its row in the database and come back.",
  "studio.tooMany":
    "Too many attempts from here. Wait an hour and try again.",
  "studio.badInput": "An address and a password of at least 8 characters.",
  "studio.notReady":
    "The database is not ready for this yet — the studio-claim migrations have not been applied, or the server has no service key. Nothing you typed is wrong.",
  "studio.failed": "The account was not created. Nothing has been half-made — try again.",
  "studio.madeButNoSignIn":
    "The account was created, but signing in straight away did not work. Go to the login page and sign in with the password you just chose.",
  "signup.checkEmail": "Check {email} for a link to confirm your address.",
  "signup.checkEmailSub":
    "You can sign in as soon as you have clicked it. If nothing arrives, look in your spam folder.",
  "signup.toLogin": "← Back to sign in",
  "signup.haveAccount": "Already have an account?",
  "signup.signIn": "Sign in",

  "forgot.link": "Forgot your password?",
  "forgot.needEmail": "Enter your email above first, then ask for a reset link.",
  "forgot.sent":
    "If that address has an account, a reset link is on its way. The link works once and lasts an hour.",

  "reset.eyebrow": "Your account",
  "reset.title": "Choose a new password",
  "reset.newPassword": "New password",
  "reset.confirm": "Repeat it",
  "reset.submit": "Save password",
  "reset.saving": "Saving…",
  "reset.mismatch": "Those two do not match.",
  "reset.failed": "Could not save the new password. Ask for a fresh link and try again.",
  "reset.done": "Saved. Taking you to your account…",
  "reset.expiredTitle": "That link has expired",
  "reset.expiredBody":
    "Reset links work once and last an hour. Ask for a new one from the sign-in page.",
  "reset.askAgain": "← Back to sign in",

  "login.useClientDemo": "Fill in the demo account",
  "login.demoNote":
    "The demo account holds invented records, so you can look around without seeing anyone's real measurements.",
  "login.back": "← Back to home",

  // common
  "common.loading": "Loading…",
  "common.retry": "Try again",
  "common.loadingAccount": "Loading account…",
  "common.saving": "Saving…",
  "common.saveFailed":
    "That did not save. Nothing has been lost — check your connection and try again.",
  "common.failedTitle": "We could not load this.",
  "common.failedSub":
    "The connection to the database failed, so this is not showing everything — nothing has been lost. Try again, and if it keeps happening check that the Supabase project is awake.",

  // dashboard
  "dash.myAccount": "My Account",
  "dash.welcome": "Welcome back, {name}",
  "dash.logout": "Log Out",
  "dash.menu": "Menu",
  "dash.messagesShort": "Messages",
  "dash.measurements.title": "1. Your Measurements",
  "dash.measurements.sub":
    "Last updated {date}. Follow the guide below and keep these current so every made-to-measure piece fits right.",
  "measure.notTaken": "Not yet taken",
  "val.tbc": "To be confirmed",
  "val.quotePending": "Quote pending",
  "measure.group.torso": "Height & Torso",
  "measure.group.legs": "Waist & Legs",
  "measure.group.arms": "Arms",
  "measure.height": "Height",
  "measure.shoulders": "Shoulders",
  "measure.chest": "Chest",
  "measure.waistNatural": "Waist (natural)",
  "measure.lowerWaist": "Lower waist",
  "measure.inseam": "Inseam",
  "measure.thigh": "Upper thigh",
  "measure.ankle": "Ankle",
  "measure.upperArm": "Upper arm",
  "measure.biceps": "Biceps",
  "measure.wrist": "Wrist",
  "measure.fitNotes": "Fit Notes",
  "measure.save": "Save Measurements",
  "measure.saved": "Measurements updated — thank you!",
  "measure.guide.front": "Front & core measurements",
  "measure.guide.arms": "Arm & leg measurements",
  "measure.guide.tip":
    "Measure over light clothing with a soft tape, snug but not tight. Everything in centimetres.",
  "measure.help.aria": "How to measure: {label}",
  "measure.help.height": "Stand barefoot and straight against a wall.",
  "measure.help.shoulders":
    "Measure across the widest points of your shoulders.",
  "measure.help.chest": "Measure around the fullest part of your chest.",
  "measure.help.waistNatural": "Measure around your natural waistline.",
  "measure.help.lowerWaist":
    "Measure around where your pants actually sit.",
  "measure.help.inseam":
    "Measure from the top of your inner thigh down to the ankle bone.",
  "measure.help.ankle": "Measure around your ankle bone.",
  "measure.help.upperArm":
    "Measure from the outer edge of your shoulder to the end of your elbow.",
  "measure.help.biceps": "Measure around the fullest part of your bicep.",
  "measure.help.wrist": "Measure around your wrist bone.",
  "measure.help.thigh": "Measure around the fullest part of your upper thigh.",
  "unit.cm": "cm",

  "dash.orders.title": "2. Your Orders",
  "dash.newOrder": "+ New Order",
  "dash.noOrders":
    "No orders yet — place your first commission whenever you're ready.",
  "dash.noFitting":
    "Nothing to try on yet. When a piece is finished you are told, and the atelier's free times appear here to pick from.",
  "order.metaReady": "Placed {placed} · Est. ready {eta}",
  "order.metaDelivered": "Placed {placed} · Est. delivered {eta}",
  "order.pendingNotice":
    "We're reviewing your request and will confirm pricing shortly.",
  "order.declined": "Declined",
  "order.fittingBooked": "Fitting booked for {date} at {time}.",
  "order.detailsPhotos": "Details & photos →",

  "dash.delivery.title": "Delivery Info",
  "dash.delivery.updated": "Last updated {date}.",
  "dash.delivery.none": "Not yet provided.",
  "dash.delivery.use": "We'll use this once a piece is ready to ship.",
  "dash.messages.title": "Message the Studio",
  "dash.messages.sub":
    "Questions about fabric, fit, or timing? Send us a message anytime.",
  "dash.messages.placeholder": "Ask about your order, fabric, timing…",

  // order statuses
  "status.received": "Order Received",
  "status.in_production": "In Production",
  "status.ready": "Ready for Fitting",
  "status.shipped": "Shipped",
  "status.delivered": "Delivered",

  // categories
  "cat.Jacket": "Jacket",
  "cat.Hoodie": "Hoodie",
  "cat.Shirt": "Shirt",
  "cat.T-Shirt": "T-Shirt",
  "cat.Shorts": "Shorts",
  "cat.Pants": "Pants",
  "cat.Cargo Set": "Cargo Set",
  "cat.Accessory": "Accessory",

  // delivery form
  "deliv.address": "Address",
  "deliv.city": "City",
  "deliv.postal": "Postal Code",
  "deliv.phone": "Phone",
  "deliv.notes": "Delivery Notes",
  "deliv.save": "Save Delivery Info",
  "deliv.saved": "Delivery info updated — thank you!",

  // wardrobe
  "wardrobe.title": "My Wardrobe",
  "wardrobe.sub":
    "Pieces we have delivered show up here on their own. Add anything else you already own so the atelier can reference your style and fit.",
  "wardrobe.adminTitle": "Wardrobe — Reference",
  "wardrobe.adminSub":
    "What this client owns — pieces delivered from the atelier, plus anything they added themselves.",
  "wardrobe.empty":
    "Nothing here yet. Delivered orders appear on their own — add pieces you already own so we can reference them.",
  "wardrobe.emptyAdmin": "Nothing delivered yet, and this client hasn't added any items.",
  "wardrobe.fromAtelier": "From the atelier",
  "wardrobe.addTitle": "Add an item",
  "wardrobe.name": "Item name",
  "wardrobe.namePlaceholder": "e.g. Black Wool Overcoat",
  "wardrobe.category": "Category",
  "wardrobe.notes": "Notes",
  "wardrobe.photos": "Photos",
  "wardrobe.add": "Add to Wardrobe",
  "wardrobe.remove": "Remove item",

  // new order
  "neworder.eyebrow": "New Commission",
  "neworder.title": "Place an Order",
  "neworder.piece": "Piece Name",
  "neworder.piecePlaceholder": "e.g. Oversized Denim Jacket",
  "neworder.category": "Category",
  "neworder.notes": "Notes (fabric, fit, colour…)",
  "neworder.refPhotos": "Reference Photos",
  "neworder.optional": "(optional, up to {n})",
  "neworder.submit": "Place Order",
  "neworder.back": "← Back to My Account",
  "neworder.warnMax":
    "You can attach up to {max} reference photos — only the first {room} were added.",
  "neworder.warnLarge": "\"{name}\" is too large (max 20MB) — skipped.",
  "photo.uploadFailed":
    "The photo did not upload. Check your connection and choose it again.",
  "neworder.warnUnreadable":
    "\"{name}\" could not be read — try saving it as a JPEG or PNG.",

  // storage

  // order detail
  "od.placed": "Placed",
  "od.targetDate": "Target date",
  "od.fitting": "Fitting",
  "od.notBooked": "Not booked",
  "od.pendingReview": "Pending Review",
  "od.manageOrder": "Manage Order",
  "od.pricePlaceholder": "Price (e.g. 250)",
  "od.accept": "Accept",
  "od.deny": "Deny",
  "od.reasonPlaceholder": "Reason (optional)",
  "od.confirmDeny": "Confirm Deny",
  "od.statusLabel": "Status (move forward or back)",
  "od.setDate": "Set",
  "od.deniedNoActions": "This order was declined — no further actions.",
  "od.refPhotos": "Reference Photos",
  "od.noPhotos": "No photos attached.",
  "od.activity": "Order Activity",
  "od.noNotes": "No notes yet. Add information or reference photos below.",
  "od.studio": "Studio",
  "od.addStudioNote": "Add a studio note",
  "od.addInfo": "Add information to this order",
  "od.notePlaceholderStudio": "Note for the client…",
  "od.notePlaceholderClient": "Add fabric, fit, or reference details…",
  "od.postNote": "Post Note",
  "od.addInfoBtn": "Add Info",
  "od.backToAccount": "← Back to My Account",
  "od.backToClient": "← Back to client",
  "od.notFound": "Order not found.",

  // pending orders list
  "od.currentStage": "Current",
  "pol.noOrders": "No orders yet.",
  "filter.label": "Filter by category",
  "filter.all": "All categories",
  "filter.none": "No orders in this category.",

  // admin overview
  "admin.studioAdmin": "Studio Admin",
  "admin.overview": "Atelier Overview",
  "admin.stat.review": "Need review",
  "admin.stat.production": "In production",
  "admin.stat.unread": "Unread messages",
  "admin.pendingOrders": "Pending Orders",
  "admin.pendingSub": "{n} orders in progress across all clients.",
  "admin.reviewCallout.one": "1 new order request needs review.",
  "admin.reviewCallout.many": "{n} new order requests need review.",
  "admin.clients": "Clients",
  "admin.clientsTotal": "{n} total.",

  // admin nav
  "adminnav.overview": "Overview",
  "adminnav.inbox": "Inbox",
  "adminnav.calendar": "Calendar",
  "adminnav.analytics": "Analytics",
  "adminnav.backup": "Download Backup",
  "adminnav.viewSite": "View Site",
  "adminnav.logout": "Log Out",
  "an.title": "Analytics",
  "an.tab.overview": "Overview",
  "an.tab.money": "Money",
  "an.tab.documents": "Documents",
  "an.sub.overview": "How the studio is doing, at a glance.",
  "an.sub.money": "What came in, what went out, and what is left.",
  "an.sub.documents":
    "The paperwork a Bulgarian atelier is expected to keep, and where each piece stands.",
  "an.revenueToDate": "Revenue to date",
  "an.declinedExcluded": "Declined orders excluded",
  "an.quotePending": "{n} still awaiting a quote",
  "an.orders": "Orders",
  "an.clients": "Clients",
  "an.avgOrder": "Average order",
  "an.awaiting": "Awaiting review",
  "an.ordersPerMonth": "Orders per month",
  "an.revenuePerMonth": "Payments per month",
  "an.byCategory": "Orders by category",
  "an.byStatus": "Pipeline by stage",
  "an.last12": "Last 12 months",
  "an.tableView": "Table view",
  "an.month": "Month",
  "an.noData": "No orders yet.",

  // ready to wear
  "adminnav.ready": "Ready Pieces",
  "ready.title": "Ready Pieces",
  "ready.sub":
    "Finished garments on the rail, ready to leave today. Commissions still run through Orders — this is only what already exists.",
  "ready.newPiece": "New Piece",
  "ready.newTitle": "Add a Ready Piece",
  "ready.editTitle": "Edit Ready Piece",
  "ready.name": "Piece",
  "ready.namePlaceholder": "e.g. Olive Cargo Set",
  "ready.category": "Category",
  "ready.size": "Size",
  "ready.price": "Price (€)",
  "ready.addedOn": "Finished on",
  "ready.status": "Status",
  "ready.heldFor": "Held for",
  "ready.soldTo": "Sold to",
  "ready.notes": "Notes",
  "ready.photos": "Photos (up to {max})",
  "ready.removePhoto": "Remove photo",
  "ready.save": "Save Piece",
  "ready.status.available": "On the rail",
  "ready.status.reserved": "Reserved",
  "ready.status.sold": "Sold",
  "ready.oneSize": "One size",
  "ready.noPrice": "No price yet",
  "ready.heldForName": "Held for {name}",
  "ready.soldToName": "Sold to {name}",
  "ready.edit": "Edit",
  "ready.delete": "Delete",
  "ready.confirmDelete": "Delete this piece?",
  "ready.filter.all": "All",
  "ready.empty": "Nothing on the rail yet. Press “+ New Piece”.",
  "ready.emptyFilter": "No pieces with this status.",
  "ready.stat.onRail": "On the rail",
  "ready.stat.reserved": "Reserved",
  "ready.stat.sold": "Sold",
  "ready.stat.stockValue": "Stock value",

  // expenses
  "exp.income": "Income",
  "exp.spend": "Expenses",
  "exp.net": "Net",
  "exp.missingDocs": "Missing documents",
  "exp.reconTitle": "Where the net figure comes from",
  "exp.fromOrders": "Accepted commissions",
  "exp.fromReady": "Ready pieces sold",
  "exp.reconNote":
    "Declined orders and pieces still unsold are left out. Commissions count from the day the order was placed, ready pieces from the day they were marked sold.",
  "exp.missingCallout":
    "{n} expenses worth {value} have no invoice filed. Without a document behind it, an expense cannot be deducted — chase these before the year closes.",
  "exp.perMonth": "Expenses per month",
  "exp.byCategory": "Expenses by category",
  "exp.listTitle": "All expenses",
  "exp.listSub": "{n} recorded.",
  "exp.filterMissing": "Missing documents",
  "exp.newExpense": "New Expense",
  "exp.empty": "No expenses recorded yet.",
  "exp.emptyFilter": "Every expense has its document. Nothing to chase.",
  "exp.newTitle": "Record an Expense",
  "exp.editTitle": "Edit Expense",
  "exp.date": "Date",
  "exp.category": "Category",
  "exp.vendor": "Supplier",
  "exp.vendorPlaceholder": "Who was paid",
  "exp.description": "What for",
  "exp.amount": "Amount (€)",
  "exp.document": "Document",
  "exp.onFile": "On file",
  "exp.noDocument": "None",
  "exp.hasDocument": "Invoice or receipt is filed",
  "exp.hasDocumentHint":
    "Untick this and the expense is flagged until the document turns up.",
  "exp.documentNo": "Document no.",
  "exp.save": "Save Expense",
  "exp.badAmount": "Enter an amount greater than zero.",
  "exp.cat.materials": "Fabric & materials",
  "exp.cat.trims": "Trims & thread",
  "exp.cat.equipment": "Machines & equipment",
  "exp.cat.rent": "Rent",
  "exp.cat.utilities": "Utilities",
  "exp.cat.shipping": "Courier",
  "exp.cat.packaging": "Packaging & labels",
  "exp.cat.marketing": "Marketing",
  "exp.cat.software": "Software & subscriptions",
  "exp.cat.accounting": "Accounting",
  "exp.cat.socialSecurity": "Social security",
  "exp.cat.taxes": "Taxes",
  "exp.cat.subcontract": "Subcontractors",
  "exp.cat.transport": "Transport",
  "exp.cat.other": "Other",

  // administrative documents
  "doc.status": "Status",
  "doc.details": "Details",
  "doc.notes": "Notes",
  "doc.notesPlaceholder": "Reference numbers, who is handling it, where it is filed…",
  "doc.dueOn": "Due on",
  "doc.remove": "Remove",
  "doc.section": "Section",
  "doc.stat.done": "Done",
  "doc.stat.outstanding": "Outstanding",
  "doc.stat.notApplicable": "Doesn’t apply",
  "doc.disclaimer":
    "A working checklist, not tax or legal advice. The figures and deadlines here are the ones in force in 2026 — confirm anything you are about to act on with your accountant, and mark whatever doesn’t apply to you as such.",
  "doc.status.todo": "Not started",
  "doc.status.in_progress": "In progress",
  "doc.status.done": "Done",
  "doc.status.na": "Doesn’t apply",
  "doc.every.once": "One-time",
  "doc.every.monthly": "Monthly",
  "doc.every.annual": "Annual",
  "doc.group.setup": "Business setup",
  "doc.group.setup.sub": "The atelier on paper.",
  "doc.group.tax": "Tax & VAT",
  "doc.group.tax.sub": "Invoices, thresholds and the annual filings.",
  "doc.group.social": "Social security",
  "doc.group.social.sub": "Your own contributions as a self-insured person.",
  "doc.group.consumer": "Selling & consumers",
  "doc.group.consumer.sub": "Selling to consumers, online and in person.",
  "doc.group.product": "Product & brand",
  "doc.group.product.sub": "The garments, and the name on them.",
  "doc.group.data": "Personal data",
  "doc.group.data.sub": "Client measurements, contacts and addresses.",
  "doc.addTitle": "Add your own",
  "doc.addSub": "Anything specific to the atelier that the list above misses.",
  "doc.newTitleLabel": "What needs doing",
  "doc.newTitlePlaceholder": "e.g. Renew the fire safety certificate",
  "doc.add": "Add",

  "doc.company.title": "Business registered (ЕИК)",
  "doc.company.desc":
    "A company in the Trade Register, or a BULSTAT registration if you work as a freelancer. The number goes on every invoice you issue.",
  "doc.bank.title": "Business bank account",
  "doc.bank.desc":
    "Keeps the atelier’s money separate from your own. Your accountant works from these statements, and since 1 January 2026 everything is in euro.",
  "doc.accountant.title": "Accountant engaged",
  "doc.accountant.desc":
    "Declarations 1 and 6 go to НАП every month. Almost every deadline below is theirs to hit — but the documents are yours to hand over on time.",
  "doc.lease.title": "Atelier lease agreement",
  "doc.lease.desc":
    "A signed contract for the space, plus the landlord’s monthly invoice filed with the rest of the expenses.",
  "doc.insurance.title": "Insurance for the atelier",
  "doc.insurance.desc":
    "Optional. Covers the machines, the stock on the rail and the space itself. Worth pricing once the rail holds real value.",

  "doc.okd5.title": "ОКД-5 filed with НАП",
  "doc.okd5.desc":
    "Registers you as a self-insured person. Due within 7 days of starting activity — filed late, you lose sickness and maternity cover for that period.",
  "doc.contributions.title": "Monthly social security contributions",
  "doc.contributions.desc":
    "Paid on your chosen insurable income by the 25th of the following month. The single most common thing to fall behind on.",

  "doc.invoices.title": "Invoices issued and filed",
  "doc.invoices.desc":
    "Sequential numbering with no gaps, in euro, with your ЕИК on each. Keep the copies — they are what proves the income figures in the Money tab.",
  "doc.vatThreshold.title": "Watch the VAT threshold",
  "doc.vatThreshold.desc":
    "Registration becomes mandatory once taxable turnover passes €51,130 in a calendar year, and you then have 7 days to apply. Worth checking the running total every month.",
  "doc.fiscal.title": "Cash register or fiscal device",
  "doc.fiscal.desc":
    "Required the moment you take cash, card or cash-on-delivery. Bank transfer alone is exempt — which is why many small ateliers invoice and take transfers only.",
  "doc.annualReturn.title": "Annual tax return",
  "doc.annualReturn.desc":
    "Companies file under чл. 92 ЗКПО between 1 March and 30 June. As a sole trader or an individual you file under чл. 50 ЗДДФЛ instead.",
  "doc.gfo.title": "Publish the annual financial statement",
  "doc.gfo.desc":
    "The ГФО goes to the Trade Register by 30 September, separately from the tax return. Missing it carries a fine even in a year with no activity.",

  "doc.eshop.title": "Declare the online shop to НАП",
  "doc.eshop.desc":
    "Required under Наредба Н-18 before you take online orders that need a receipt. Not needed while the site only collects enquiries and fittings.",
  "doc.terms.title": "Terms, returns and the 14-day rule",
  "doc.terms.desc":
    "Distance buyers get 14 days to withdraw — but a garment cut to a customer’s own measurements is exempt. A ready piece off the rail is not, so say which is which in writing.",

  "doc.labelling.title": "Fibre composition labels",
  "doc.labelling.desc":
    "Every garment carries its fibre composition, in Bulgarian, on a durable label. Care symbols customarily go alongside it.",
  "doc.trademark.title": "Trademark for the name",
  "doc.trademark.desc":
    "Optional. Registering Tidote with the Patent Office covers Bulgaria; EUIPO covers the whole EU. Cheapest before somebody else wants the name.",

  "doc.privacy.title": "Privacy policy on the site",
  "doc.privacy.desc":
    "You hold measurements, contact details and addresses — all personal data. Say what you collect, why, how long you keep it, and how someone asks for it back.",
  "doc.processingRegister.title": "Register of processing activities",
  "doc.processingRegister.desc":
    "An internal record of what data you hold and on what basis. A short document, but the first one an inspector asks for. Review it once a year.",

  // admin shell / dashboard
  "admin.group.clients": "Clients",
  "admin.group.orders": "Orders",
  "admin.group.studio": "Studio",
  "admin.allClients": "All Clients",
  "admin.search": "Search by name, phone, email…",
  "admin.newClient": "New Client",
  "admin.stat.clientsCount": "Clients",
  "admin.stat.totalOrders": "Total orders",
  "admin.stat.inProgress": "In progress",
  "admin.stat.revenue": "Revenue",
  "admin.clientsEmpty": "No clients yet. Press “+ New Client”.",
  "admin.col.client": "Client",
  "admin.col.phone": "Phone",
  "admin.col.orders": "Orders",
  "admin.col.last": "Last",
  "admin.ordersInCategory": "{n} orders in this category.",
  "admin.allOrders": "All",
  "admin.allOrdersTitle": "All Orders",
  "admin.ordersTotal": "{n} orders in total.",
  "newclient.title": "New Client",
  "newclient.name": "Name",
  "newclient.email": "Email",
  "newclient.phone": "Phone",
  "newclient.password": "Temporary password",
  "newclient.create": "Create Client",
  "newclient.cancel": "Cancel",
  "newclient.dupEmail": "A client with that email already exists.",
  "newclient.badInput":
    "A name, an email address and a password of at least 8 characters.",
  "newclient.failed":
    "The account was not created. Nothing has been half-made — try again.",

  // client roster
  "roster.orders": "{n} orders",
  "roster.measured": "Measured {date}",
  "roster.noMeasure": "No measurements yet",
  "roster.none": "No clients yet.",

  // inbox
  "inbox.title": "Inbox",
  "inbox.sub": "All client conversations in one place.",
  "inbox.select": "Select a conversation to read and reply.",
  "inbox.noMessages": "No messages yet.",
  "inbox.you": "You: ",

  // calendar
  "cal.title": "Fitting Calendar",
  "cal.sub":
    "Fittings follow your weekly hours. Change a single date below when you need an exception, and see order due-dates and booked fittings at a glance.",
  "cal.back": "← Back to Overview",
  "cal.selectDate":
    "Select a date to open/close it and manage fitting slots.",
  "cal.openDay": "Open Day",
  "cal.closeDay": "Close Day",
  "cal.addSlot": "Add Slot",
  "cal.remove": "Remove",
  "cal.noSlots": "No open slots yet.",
  "cal.bookedFittings": "Booked Fittings",
  "cal.customDay": "Set by hand for this date.",
  "cal.followingWeekly": "Following your weekly hours.",
  "cal.useWeekly": "Use weekly hours",
  "cal.legend.open": "Weekly hours",
  "cal.legend.custom": "Changed by hand",
  "cal.legend.orderDue": "Order due",
  "cal.legend.booked": "Fitting booked",

  // weekly hours
  "hours.title": "Weekly Hours",
  "hours.sub":
    "The standing schedule fittings are offered on. Every date follows this until you change that date on the calendar.",
  "hours.restore": "Restore defaults",
  "hours.from": "from",
  "hours.to": "to",
  "hours.closed": "Closed",
  "hours.tooShort": "Window too short",
  "hours.slotCount": "{n} slots",
  "hours.slotLength": "Fitting length",
  "hours.minutes": "{n} min",
  "hours.overrideNote":
    "Changing a single date on the calendar affects that date only — the weekly pattern stays as it is.",
  "picker.readyBook": "Ready for fitting — book a slot",
  "picker.pickDay": "Pick a highlighted day to see open times.",

  // notifications
  "notif.title": "Notifications",
  "notif.markAll": "Mark all read",
  "notif.empty": "Nothing new right now.",
  "notif.justNow": "just now",
  "notif.mAgo": "{n}m ago",
  "notif.hAgo": "{n}h ago",
  "notif.dAgo": "{n}d ago",

  // messages
  "msg.empty": "No messages yet — say hello!",
  "msg.placeholder": "Type a message…",
  "msg.send": "Send",

  // photo thumb
  "thumb.noPhoto": "No photo",

  // admin client
  "adminclient.profile": "Client Profile",
  "adminclient.orders": "Orders",
  "adminclient.measurements": "Measurements",
  "adminclient.notProvided": "Not yet provided.",
  "adminclient.lastUpdated": "Last updated {date}.",
  "adminclient.fitNotes": "Fit Notes",
  "adminclient.delivery": "Delivery Info",
  "adminclient.noAddress": "No address on file.",
  "adminclient.messages": "Messages",
  "adminclient.replyHint":
    "Reply to {name} here — they'll see it in their account.",
  "adminclient.msgPlaceholder": "Message {name}…",
  "adminclient.notFound": "No client found with that id.",
  "adminclient.back": "Back to overview",
  "common.close": "Close",
  "common.cancel": "Cancel",

  "photos.title": "Photos of your piece",
  "photos.sub":
    "Wearing it? Add your own photos here. They stay between you and the atelier unless you say otherwise below.",
  "photos.adminTitle": "Client photos",
  "photos.adminSub": "Uploaded by the client from their own account.",
  "photos.upload": "Add photos",
  "photos.remove": "Remove photo",
  "photos.view": "View photo {n}",
  "photos.consent":
    "Tidote Atelier may use these photos to show its work — website, social media and lookbooks.",
  "photos.consentOn": "Turned on {date}. You can turn it off at any time.",
  "photos.consentOff": "Off. The photos stay private to the atelier.",
  "photos.mayUse": "The client agreed on {date} that these may be used publicly.",
  "photos.mayNotUse": "Not for publication. The client has not agreed to these being used.",

  "ret.title": "Return",
  "ret.mark": "Mark as returned",
  "ret.explain":
    "The piece comes back to the atelier. It leaves the client's wardrobe and stops counting as income.",
  "ret.toStock": "Put it on the rail as In Stock",
  "ret.confirm": "Confirm return",
  "ret.returnedOn": "Returned on {date}.",
  "ret.undo": "Undo return",
  "ret.undoKeptStock":
    "The rail piece was already sold, so it stayed on the rail. Remove it by hand in Ready Pieces if that is wrong.",
  "ret.clientNotice":
    "This piece was returned to the atelier on {date}.",
  "order.returned": "Returned",

  "gen.notif.returned": "Your return of {piece} has been recorded.",
  "delclient.action": "Delete client",
  "delclient.title": "Delete {name}?",
  "delclient.intro": "This removes the client and everything filed under them:",
  "delclient.lossOrders": "{n} order(s), including notes, photos and prices",
  "delclient.lossMeasurements": "Their measurements and delivery details",
  "delclient.lossMessages": "{n} message(s) in the thread with the studio",
  "delclient.lossItems": "{n} wardrobe reference piece(s)",
  "delclient.activeWarning":
    "Careful — {n} of their orders is still in progress. Deleting will not notify them.",
  "delclient.irreversible":
    "This cannot be undone, and they will no longer be able to log in.",
  "delclient.typeName": "Type “{name}” to confirm",
  "delclient.confirm": "Delete permanently",
  "delclient.cancel": "Cancel",

  // generated messages + notifications
  "gen.msg.accepted":
    "Great news — your order for \"{piece}\" has been accepted! Price: {total}. We'll keep you updated as it moves through production.",
  "gen.msg.denied":
    "We're sorry, but we can't take on your order for \"{piece}\" right now.{reason}",
  "gen.notif.orderPlaced": "{name} placed a new order: \"{piece}\".",
  "gen.notif.acceptedClient": "Your order \"{piece}\" was accepted ({total}).",
  "gen.notif.deniedClient": "Your order \"{piece}\" was declined.",
  "gen.notif.statusChanged": "\"{piece}\" is now {status}.",
  "gen.notif.deadline": "New target date for \"{piece}\": {eta}.",
  "gen.notif.msgFromClient": "{name} sent you a message.",
  "gen.notif.msgFromStudio": "The studio sent you a message.",
  "gen.notif.wardrobeAdded": "The studio added \"{piece}\" to your wardrobe.",
  "gen.notif.noteFromClient": "{name} added info to \"{piece}\".",
  "gen.notif.noteFromStudio": "The studio added a note to \"{piece}\".",
  "auth.badLogin": "That email/password doesn't match our records.",
  "auth.noBackend":
    "The site is not connected to its database yet, so nobody can sign in. See SETUP.md.",
  "auth.unreachable":
    "Could not reach the database. Check your connection and try again.",

  // Garment names the studio reuses. Anything else passes through.
  "piece.Burgundy Track Jacket": "Burgundy Track Jacket",
  "piece.Olive Cargo Set": "Olive Cargo Set",
  "piece.Black Puffer Jacket": "Black Puffer Jacket",
  "piece.Gold Graphic Hoodie": "Gold Graphic Hoodie",
  "piece.Mint Track Pants": "Mint Track Pants",
  "piece.Panelled Track Jacket": "Panelled Track Jacket",
  "piece.Reworked Graphic Tee": "Reworked Graphic Tee",

};

const bg: Dict = {
  // chrome / nav
  "header.tagline": "По поръчка · София",
  "nav.casual": "Ежедневни",
  "nav.sports": "Спортни",
  "nav.about": "За нас",
  "nav.how": "Как работим",
  "nav.gallery": "Галерия",
  "nav.custom": "По поръчка",
  "nav.inStock": "Готови модели",
  "header.login": "Вход",
  "header.account": "Профил",
  "header.studioAdmin": "Студио",

  // footer
  "footer.tagline":
    "Антидотът срещу посредствеността. Уникален streetwear стил за мъже, които не остават незабелязани.",
  "footer.explore": "Разгледай",
  "footer.shop": "Магазин",
  "footer.connect": "Контакти",
  "footer.rights": "© {year} Tidote Atelier. Всички права запазени.",
  "footer.privacy": "Политика за поверителност",

  // 404
  "nf.eyebrow": "Грешка 404",
  "nf.title": "Тази бройка не съществува",
  "nf.body":
    "Страницата, която търсиш, е преместена, преименувана или никога не е съществувала. Останалото от ателието е тук.",
  "nf.home": "Обратно към началото",
  "nf.browse": "Разгледай колекцията",

  // hero
  "hero.tagline":
    "Антидотът срещу посредствеността — streetwear по мярка за мъже, които не остават незабелязани.",
  "hero.cta": "Поръчай сега",
  "hero.scroll": "Надолу",

  // shop tiles
  "shop.getYours": "Поръчай сега",
  "shop.viewLookbook": "Виж колекцията",
  "cat.casual.title": "Ежедневни",
  "cat.casual.copy": "Свободни суитшърти, дънки и удобни модели за всеки ден.",
  "cat.sports.title": "Спортни",
  "cat.sports.copy": "Спортни якета, шушляци и технични спортни кройки.",

  // category pages
  "cat.casual.eyebrow": "Ежедневни",
  "cat.casual.pageTitle": "СТИЛ ЗА ВСЕКИ ДЕН",
  "cat.casual.blurb":
    "Свободни суитшърти, дънки и удобни ежедневни модели — streetwear за всеки ден, скроен и завършен с грижата на изработката по мярка.",
  "cat.casual.piecesTitle": "Ежедневни модели",
  "cat.sports.eyebrow": "Спортни",
  "cat.sports.pageTitle": "СПОРТНИ ДРЕХИ",
  "cat.sports.blurb":
    "Спортни якета, шушляци и технични кройки — атлетични силуети, пресъздадени със същата прецизност по мярка, както всичко останало в ателието.",
  "cat.sports.piecesTitle": "Спортни модели",
  "catpage.lookbook": "Колекцията",
  "catpage.follow": "Последвай",

  // in stock (public rail)
  "instock.eyebrow": "Готови за носене",
  "instock.pageTitle": "ГОТОВИ МОДЕЛИ",
  "instock.blurb":
    "Завършени модели, ушити в ателието в София. По един брой от всеки, в посочения размер \u2014 щом се вземе, няма друг.",
  "instock.railTitle": "На закачалката",
  "instock.count": "{n} модела",
  "instock.countOne": "1 модел",
  "instock.reserved": "Запазен",
  "instock.available": "Свободен",
  "instock.priceOnRequest": "Цена при запитване",
  "instock.ask": "Запитване",
  "instock.countUnknown": "Не се зареди",
  "instock.errorTitle": "Не успяхме да заредим закачалката.",
  "instock.errorSub":
    "Нещо се обърка между тук и ателието — това не значи, че няма налични модели. Опитайте отново или просто ни попитайте какво има.",
  "instock.empty": "В момента закачалката е празна.",
  "instock.emptySub":
    "Всичко тук е започнало като поръчка. Кажи какво искаш и ще го ушием за теб.",
  "instock.commissionTitle": "Не е твоят размер?",
  "instock.commissionCopy":
    "Всеки модел на ателието се шие по мярка. Започни поръчка и ще го направим по твоите мерки.",
  "instock.commissionCta": "Започни поръчка",
  "instock.lookbook": "Виж колекцията",

  // buying journey — explicit CTAs, and the facts a buyer needs first
  "cta.explore": "Разгледай моделите",
  "cta.viewPieces": "Виж моделите",
  "cta.commission": "Заяви по мярка",
  "cta.shopInStock": "Виж наличните",
  "cta.browseFree": "За разглеждане не е нужен профил.",
  "cta.signInLater": "Влизате в профил, когато има поръчка.",

  "hero.prop": "Streetwear по мярка, изработен в София.",
  "hero.propSub":
    "Всяка дреха се скроява по вашите мерки в ателието ни. Тук нищо не е масово производство и нищо не се прави два пъти.",

  "choose.title": "Три начина да си вземете",
  "choose.sub":
    "Разгледайте всичко без профил. Влизате само когато има поръчка за правене.",
  "choose.stock.title": "Готови модели",
  "choose.stock.copy":
    "Завършени модели, готови за вземане днес. По един брой от всеки, в посочения размер.",
  "choose.custom.title": "По мярка",
  "choose.custom.copy":
    "Започнете от модел от колекцията и го скрояваме по вашите мерки.",
  "choose.bespoke.title": "По идея",
  "choose.bespoke.copy":
    "Донесете идея, която я няма в колекцията, и ателието я изработва.",

  "fact.madeToMeasure": "По мярка",
  "fact.inStockNow": "В наличност",
  "fact.readyToday": "Готово днес",
  "fact.lead": "{min}–{max} работни дни",
  "fact.fittings": "Включени проби: {n}",
  "fact.adjust": "Безплатни корекции {n} дни",
  "fact.from": "от {price}",
  "fact.quoted": "Цена при запитване",

  "terms.eyebrow": "По мярка",
  "terms.title": "Как става поръчката по мярка",
  "flow.1": "Избирате модел",
  "flow.2": "Казвате какво искате",
  "flow.3": "Мерки",
  "flow.4": "Изработваме я",
  "flow.5": "Проба",
  "flow.6": "Готова дреха",
  "terms.q.lead": "Колко време отнема?",
  "terms.a.lead":
    "{min}\u2013{max} работни дни от момента, в който приемете офертата.",
  "terms.a.leadUnset":
    "Зависи от дрехата, затова получавате срока заедно с офертата \u2014 преди да се обвържете с нещо. После в страницата на поръчката виждате докъде е стигнала.",
  "terms.q.fitting": "Как става пробата?",
  "terms.a.fitting":
    "{n} проби в ателието в София са включени в цената. Щом дрехата е готова, си избирате час от календара на ателието в профила си.",
  "terms.a.fittingUnset":
    "Щом дрехата е готова, получавате известие и си избирате час за проба в ателието в София \u2014 от календара на ателието в профила си.",
  "terms.q.adjust": "А ако не стои както трябва?",
  "terms.a.adjust":
    "Корекциите са безплатни {n} дни след като получите дрехата. Пишете ни от профила си и ги насрочваме.",
  "terms.a.adjustUnset":
    "Точно за това е пробата: дрехата се коригира в ателието, преди да излезе от него. Ако забележите нещо по-късно, пишете ни от профила си и ще ви кажем какво може да се направи.",
  // enquiries
  "enq.title": "Попитайте ателието",
  "enq.sub": "Без профил — отговаряме по имейл или телефон.",
  "enq.about": "Относно {piece}. Без нужда от профил.",
  "enq.name": "Вашето име",
  "enq.email": "Имейл",
  "enq.phone": "Телефон",
  "enq.message": "Какво бихте искали да знаете?",
  "enq.send": "Изпрати запитване",
  "enq.sending": "Изпращане…",
  "enq.sent": "Изпратено.",
  "enq.sentSub": "Ателието го получи и ще ви отговори.",
  "enq.failed": "Не се изпрати. Опитайте отново или пишете на support@tidoteatelier.com.",
  "enq.needContact": "Оставете имейл или телефон, за да можем да отговорим.",
  "enq.needBoth": "Име и съобщение, за да знаем кой пита и за какво.",
  "enq.tooMany":
    "Твърде много запитвания от едно място. Изчакайте няколко минути или пишете на support@tidoteatelier.com.",
  "enq.privacy":
    "Използваме написаното тук само за да ви отговорим. Вижте Политиката за поверителност.",
  "enqadmin.open": "Чакащи запитвания ({n})",
  "enqadmin.done": "Отбележи като отговорено",
  "enqadmin.failedTitle": "Запитванията не се заредиха.",
  "enqadmin.failedSub":
    "Разговорите с клиентите отдолу не са засегнати. Ако отваряш страницата за пръв път, таблицата за запитвания може още да не е създадена в базата.",

  // worn by
  "nav.wornBy": "Носят Tidote",
  "worn.eyebrow": "Хора, които избраха нас",
  "worn.pageTitle": "НОСЯТ TIDOTE",
  "worn.blurb":
    "Хората, които избраха да им ушием, и ни позволиха да го кажем.",
  "worn.empty": "Тази стена още се подрежда.",
  "worn.emptySub":
    "Дрехите са навън. Имената идват тук, когато собствениците им се съгласят.",
  "worn.emptyCta": "Започни поръчка",
  "worn.wearing": "Носи",
  "worn.example": "Примерен запис",
  "worn.exampleNote":
    "Измислен запис, показващ как ще изглежда истинският. Махаме го щом дойде първото истинско име.",
  "worn.studioOnly":
    "Вижда се само от теб. Посетителите виждат празна стена, докато не добавим истинско име — измислена препоръка не им показваме.",
  "shop.inStockCta": "Виж наличните модели",
  "shop.inStockCopy":
    "Не за всичко се чака \u2014 някои модели са готови и висят на закачалката днес.",

  // process
  "home.process.title": "Как изработваме всяка дреха",
  "process.1.title": "Дизайн",
  "process.1.copy":
    "Всяка дреха започва като скица, вдъхновена от улицата и изработена за максимален комфорт.",
  "process.2.title": "Ръчна изработка",
  "process.2.copy":
    "Кроено, шито и завършено в ателието — без масово производство и без компромиси.",
  "process.3.title": "Прилягане",
  "process.3.copy":
    "Всяка дреха по поръчка се изработва спрямо личните мерки на клиента.",
  "process.4.title": "Доставка",
  "process.4.copy":
    "Всяка поръчка се изпраща до удобен за вас адрес на зададената дата.",

  // journey
  "home.journey.eyebrow": "От първата проба до готовата дреха",
  "home.journey.title": "Вашият път до дреха по мярка",
  "home.journey.cta": "Започни поръчка",
  "journey.1.short": "Мерки",
  "journey.2.short": "Поръчки",
  "journey.3.short": "Проба",
  "journey.4.short": "Доставка",
  "journey.1.title": "Въведете мерките си",
  "journey.1.copy":
    "Запишете мерките си, за да приляга всяка дреха идеално.",
  "journey.2.title": "Направете поръчка",
  "journey.2.copy":
    "Изберете категория, опишете дрехата и добавете примерни снимки, ако желаете.",
  "journey.3.title": "Елате на проба",
  "journey.3.copy":
    "Щом дрехата е готова, ще ви уведомим — запазете удобен час за проба.",
  "journey.4.title": "Въведете данни за доставка",
  "journey.4.copy":
    "Кажете ни къде да изпратим готовата дреха или си я вземете от ателието.",

  // about
  "about.eyebrow": "За нас",
  "about.headline": "Антидотът срещу посредствеността",
  "about.copy":
    "Tidote Atelier е софийско ателие за мъжка мода, което създава уникален, неповторим streetwear за мъже, които не искат да се сливат с тълпата. Всяка колекция пресъздава streetwear културата през призмата на изработката по мярка — това, което носите, е направено специално за вас.",

  "proof.eyebrow": "В ателието",
  "proof.title": "Къде се изработва",
  "proof.sofia.title": "Едно ателие, в София",
  "proof.sofia.copy":
    "Всичко се изработва в същото студио — там минават и пробите.",
  "proof.inHouse.title": "Кроим и шием на място",
  "proof.inHouse.copy":
    "Кройките, кроенето и шиенето са тук — нищо не се дава на фабрика.",
  "proof.oneOff.title": "Една дреха наведнъж",
  "proof.oneOff.copy":
    "Дрехата по поръчка се крои по вашите мерки — прави се веднъж и става на един човек.",
  "proof.fitting.title": "Проба на живо",
  "proof.fitting.copy":
    "Пробвате дрехата, преди да е завършена, и се коригира, докато още е на манекена.",

  // gallery
  "gallery.eyebrow": "Директно от Instagram",
  "gallery.follow": "Instagram",

  // login
  "login.eyebrow": "Достъп за клиенти",
  "login.title": "ВЛЕЗТЕ, ЗА ДА ПРОСЛЕДИТЕ ПОРЪЧКАТА СИ",
  "login.sessionUnreadable":
    "Все още сте влезли, но не успяхме да се свържем с базата, за да прочетем профила ви. Паролата ви е наред — опитайте отново след малко.",
  "login.email": "Имейл",
  "login.password": "Парола",
  "login.submit": "Вход",
  "login.submitting": "Влизане…",
  "login.noAccount": "За първи път тук?",
  "login.createOne": "Създайте профил",

  "signup.eyebrow": "Нов профил",
  "signup.title": "Създайте своя профил",
  "signup.name": "Вашето име",
  "signup.namePlaceholder": "напр. Димитър Колев",
  "signup.submit": "Създай профил",
  "signup.submitting": "Създаване…",
  "signup.passwordHint": "Поне 8 символа.",
  "signup.shortPassword": "Използвайте поне 8 символа.",
  "signup.taken": "Вече има профил с този имейл. Опитайте да влезете.",
  "signup.failed": "Профилът не можа да бъде създаден. Опитайте отново.",
  "signup.rateLimited":
    "Твърде много опити за регистрация от тук през последния час, затова имейлът за потвърждение не можа да се изпрати. Опитайте по-късно или ни пишете на support@tidoteatelier.com и ще създадем профила вместо вас.",

  "studio.eyebrow": "Ателие",
  "studio.title": "СЪЗДАЙ ПРОФИЛА НА АТЕЛИЕТО",
  "studio.blurb":
    "За профила на самото ателие. Адресът трябва да е в списъка на ателието в базата — паролата отдолу си я избираш ти и нищо не се изпраща по имейл.",
  "studio.newPassword": "Твоята парола",
  "studio.repeatPassword": "Повтори паролата",
  "studio.submit": "Създай профила на ателието",
  "studio.mismatch": "Двете пароли не съвпадат.",
  "studio.refused":
    "Този адрес не отваря нищо. Трябва да е в списъка на ателието в базата и да няма вече профил.",
  "studio.exists":
    "Вече има профил с този адрес. Влез с него или изчисти claimed_at на реда му в базата и опитай пак.",
  "studio.tooMany": "Твърде много опити от тук. Изчакай един час и опитай отново.",
  "studio.badInput": "Адрес и парола от поне 8 знака.",
  "studio.notReady":
    "Базата още не е готова за това — миграциите за профила на ателието не са приложени или сървърът няма service key. Нищо от въведеното не е грешно.",
  "studio.failed": "Профилът не беше създаден. Няма нищо недовършено — опитай отново.",
  "studio.madeButNoSignIn":
    "Профилът е създаден, но автоматичното влизане не сработи. Отиди на страницата за вход и влез с паролата, която току-що избра.",
  "signup.checkEmail": "Проверете {email} за връзка, с която да потвърдите адреса си.",
  "signup.checkEmailSub":
    "Ще може да влезете веднага щом я отворите. Ако не пристигне нищо, проверете в спам.",
  "signup.toLogin": "← Обратно към входа",
  "signup.haveAccount": "Вече имате профил?",
  "signup.signIn": "Вход",

  "forgot.link": "Забравена парола?",
  "forgot.needEmail": "Първо въведете имейла си по-горе, след това поискайте връзка.",
  "forgot.sent":
    "Ако този адрес има профил, връзката за смяна е на път. Тя важи веднъж и за един час.",

  "reset.eyebrow": "Вашият профил",
  "reset.title": "Изберете нова парола",
  "reset.newPassword": "Нова парола",
  "reset.confirm": "Повторете я",
  "reset.submit": "Запази паролата",
  "reset.saving": "Запазване…",
  "reset.mismatch": "Двете не съвпадат.",
  "reset.failed": "Паролата не можа да бъде запазена. Поискайте нова връзка и опитайте пак.",
  "reset.done": "Запазено. Отвеждаме ви към профила ви…",
  "reset.expiredTitle": "Връзката е изтекла",
  "reset.expiredBody":
    "Връзките важат веднъж и за един час. Поискайте нова от страницата за вход.",
  "reset.askAgain": "← Обратно към входа",

  "login.useClientDemo": "Попълни демо профила",
  "login.demoNote":
    "Демо профилът съдържа измислени данни, така че можете да разгледате, без да виждате ничии реални мерки.",
  "login.back": "← Обратно към началото",

  // common
  "common.loading": "Зареждане…",
  "common.retry": "Опитай отново",
  "common.loadingAccount": "Зареждане на профила…",
  "common.saving": "Запазване…",
  "common.saveFailed":
    "Това не се запази. Нищо не е загубено — провери връзката и опитай отново.",
  "common.failedTitle": "Не успяхме да заредим това.",
  "common.failedSub":
    "Връзката с базата не сработи, така че тук не се вижда всичко — нищо не е загубено. Опитай отново, а ако продължава, провери дали Supabase проектът работи.",

  // dashboard
  "dash.myAccount": "Моят профил",
  "dash.welcome": "Добре дошли, {name}",
  "dash.logout": "Изход",
  "dash.menu": "Меню",
  "dash.messagesShort": "Съобщения",
  "dash.measurements.title": "1. Вашите мерки",
  "dash.measurements.sub":
    "Последна промяна: {date}. Следвайте ръководството по-долу и поддържайте мерките си актуални, за да приляга всяка дреха по мярка.",
  "measure.notTaken": "Още не са въведени",
  "val.tbc": "Предстои потвърждение",
  "val.quotePending": "Очаква оферта",
  "measure.group.torso": "Ръст и торс",
  "measure.group.legs": "Талия и крака",
  "measure.group.arms": "Ръце",
  "measure.height": "Ръст",
  "measure.shoulders": "Рамене",
  "measure.chest": "Гръдна обиколка",
  "measure.waistNatural": "Талия",
  "measure.lowerWaist": "Ниска талия",
  "measure.inseam": "Вътрешен шев",
  "measure.thigh": "Бедро",
  "measure.ankle": "Глезен",
  "measure.upperArm": "Мишница",
  "measure.biceps": "Бицепс",
  "measure.wrist": "Китка",
  "measure.fitNotes": "Бележки за прилягането",
  "measure.save": "Запази мерките",
  "measure.saved": "Мерките са запазени — благодарим!",
  "measure.guide.front": "Мерки отпред и торс",
  "measure.guide.arms": "Мерки на ръце и крака",
  "measure.guide.tip":
    "Мерете върху тънко облекло с мек метър — прилепнал, но не стегнат. Всичко в сантиметри.",
  "measure.help.aria": "Как се мери: {label}",
  "measure.help.height": "Застанете бос и изправен до стена.",
  "measure.help.shoulders":
    "Измерете по най-широката част на раменете.",
  "measure.help.chest": "Измерете около най-широката част на гърдите.",
  "measure.help.waistNatural": "Измерете около естествената талия.",
  "measure.help.lowerWaist":
    "Измерете там, където реално стои панталонът.",
  "measure.help.inseam":
    "Измерете от горната част на вътрешното бедро до глезенната кост.",
  "measure.help.ankle": "Измерете около глезенната кост.",
  "measure.help.upperArm":
    "Измерете от външния ръб на рамото до края на лакътя.",
  "measure.help.biceps": "Измерете около най-широката част на бицепса.",
  "measure.help.wrist": "Измерете около китката.",
  "measure.help.thigh":
    "Измерете около най-широката част на горното бедро.",
  "unit.cm": "см",

  "dash.orders.title": "2. Вашите поръчки",
  "dash.newOrder": "+ Нова поръчка",
  "dash.noOrders":
    "Все още нямате поръчки — направете първата си, когато сте готови.",
  "dash.noFitting":
    "Още няма какво да пробвате. Щом дреха е готова, ще получите известие и тук ще се появят свободните часове на ателието.",
  "order.metaReady": "Поръчана на {placed} · Очаквана готовност: {eta}",
  "order.metaDelivered": "Поръчана на {placed} · Доставена на {eta}",
  "order.pendingNotice":
    "Разглеждаме заявката ви и скоро ще потвърдим цената.",
  "order.declined": "Отказана",
  "order.fittingBooked": "Проба, запазена за {date} в {time} ч.",
  "order.detailsPhotos": "Детайли и снимки →",

  "dash.delivery.title": "Данни за доставка",
  "dash.delivery.updated": "Последна промяна: {date}.",
  "dash.delivery.none": "Все още не са попълнени.",
  "dash.delivery.use": "Ще ги използваме, щом дрехата е готова за изпращане.",
  "dash.messages.title": "Съобщение до ателието",
  "dash.messages.sub":
    "Имате въпрос за плат, кройка или срокове? Пишете ни по всяко време.",
  "dash.messages.placeholder": "Попитайте за поръчката, плата или сроковете…",

  // order statuses
  "status.received": "Приета поръчка",
  "status.in_production": "В производство",
  "status.ready": "Готова за проба",
  "status.shipped": "Изпратена",
  "status.delivered": "Доставена",

  // categories
  "cat.Jacket": "Яке",
  "cat.Hoodie": "Суитшърт с качулка",
  "cat.Shirt": "Риза",
  "cat.T-Shirt": "Тениска",
  "cat.Shorts": "Къси панталони",
  "cat.Pants": "Панталон",
  "cat.Cargo Set": "Карго комплект",
  "cat.Accessory": "Аксесоар",

  // delivery form
  "deliv.address": "Адрес",
  "deliv.city": "Град",
  "deliv.postal": "Пощенски код",
  "deliv.phone": "Телефон",
  "deliv.notes": "Бележки за доставка",
  "deliv.save": "Запази данните",
  "deliv.saved": "Данните за доставка са обновени — благодарим!",

  // wardrobe
  "wardrobe.title": "Моят гардероб",
  "wardrobe.sub":
    "Доставените поръчки се появяват тук автоматично. Добавете и други модели, които вече притежавате, за да може ателието да се ориентира по вашия стил и кройка.",
  "wardrobe.adminTitle": "Гардероб — референция",
  "wardrobe.adminSub":
    "Какво притежава клиентът — доставените от ателието модели плюс всичко, което е добавил сам.",
  "wardrobe.empty":
    "Все още няма модели. Доставените поръчки се появяват сами — добавете и дрехи, които вече притежавате, за да ги ползваме за ориентир.",
  "wardrobe.emptyAdmin": "Още няма доставени поръчки, а клиентът не е добавил модели.",
  "wardrobe.fromAtelier": "От ателието",
  "wardrobe.addTitle": "Добавете модел",
  "wardrobe.name": "Име на модела",
  "wardrobe.namePlaceholder": "напр. Черно вълнено палто",
  "wardrobe.category": "Категория",
  "wardrobe.notes": "Бележки",
  "wardrobe.photos": "Снимки",
  "wardrobe.add": "Добави в гардероба",
  "wardrobe.remove": "Премахни модела",

  // new order
  "neworder.eyebrow": "Нова поръчка",
  "neworder.title": "Направете поръчка",
  "neworder.piece": "Име на дрехата",
  "neworder.piecePlaceholder": "напр. оувърсайз дънково яке",
  "neworder.category": "Категория",
  "neworder.notes": "Бележки (плат, кройка, цвят…)",
  "neworder.refPhotos": "Примерни снимки",
  "neworder.optional": "(по избор, до {n})",
  "neworder.submit": "Изпрати поръчката",
  "neworder.back": "← Обратно към профила",
  "neworder.warnMax":
    "Можете да прикачите до {max} снимки — добавени са само първите {room}.",
  "neworder.warnLarge": "„{name}“ е твърде голяма (макс. 20MB) — пропусната.",
  "photo.uploadFailed":
    "Снимката не се качи. Провери връзката и я избери отново.",
  "neworder.warnUnreadable":
    "„{name}“ не може да бъде прочетена — запишете я като JPEG или PNG.",

  // съхранение

  // order detail
  "od.placed": "Поръчана",
  "od.targetDate": "Очаквана дата",
  "od.fitting": "Проба",
  "od.notBooked": "Незаписана",
  "od.pendingReview": "Очаква преглед",
  "od.manageOrder": "Управление на поръчката",
  "od.pricePlaceholder": "Цена (напр. 250)",
  "od.accept": "Приеми",
  "od.deny": "Откажи",
  "od.reasonPlaceholder": "Причина (по избор)",
  "od.confirmDeny": "Потвърди отказа",
  "od.statusLabel": "Статус (напред или назад в процеса)",
  "od.setDate": "Запази",
  "od.deniedNoActions": "Тази поръчка беше отказана — няма повече действия.",
  "od.refPhotos": "Примерни снимки",
  "od.noPhotos": "Няма прикачени снимки.",
  "od.activity": "Движение по поръчката",
  "od.noNotes": "Все още няма бележки. Добавете информация или снимки по-долу.",
  "od.studio": "Ателие",
  "od.addStudioNote": "Добавете бележка от ателието",
  "od.addInfo": "Добавете информация към поръчката",
  "od.notePlaceholderStudio": "Бележка за клиента…",
  "od.notePlaceholderClient": "Добавете детайли за плат, кройка или примери…",
  "od.postNote": "Публикувай",
  "od.addInfoBtn": "Добави",
  "od.backToAccount": "← Обратно към профила",
  "od.backToClient": "← Обратно към клиента",
  "od.notFound": "Поръчката не е намерена.",

  // pending orders list
  "od.currentStage": "Сега",
  "pol.noOrders": "Все още няма поръчки.",
  "filter.label": "Филтър по категория",
  "filter.all": "Всички категории",
  "filter.none": "Няма поръчки в тази категория.",

  // admin overview
  "admin.studioAdmin": "Админски панел",
  "admin.overview": "Общ преглед",
  "admin.stat.review": "За преглед",
  "admin.stat.production": "В производство",
  "admin.stat.unread": "Непрочетени",
  "admin.pendingOrders": "Текущи поръчки",
  "admin.pendingSub": "{n} активни поръчки от всички клиенти.",
  "admin.reviewCallout.one": "1 нова заявка за поръчка чака преглед.",
  "admin.reviewCallout.many": "{n} нови заявки за поръчки чакат преглед.",
  "admin.clients": "Клиенти",
  "admin.clientsTotal": "общо {n}.",

  // admin nav
  "adminnav.overview": "Обзор",
  "adminnav.inbox": "Съобщения",
  "adminnav.calendar": "Календар",
  "adminnav.analytics": "Анализи",
  "adminnav.backup": "Изтегли резервно копие",
  "adminnav.viewSite": "Към сайта",
  "adminnav.logout": "Изход",
  "an.title": "Анализи",
  "an.tab.overview": "Обзор",
  "an.tab.money": "Пари",
  "an.tab.documents": "Документи",
  "an.sub.overview": "Как върви ателието — накратко.",
  "an.sub.money": "Какво е влязло, какво е излязло и какво остава.",
  "an.sub.documents":
    "Документите, които едно ателие в България трябва да води, и докъде е стигнало всяко от тях.",
  "an.revenueToDate": "Оборот до момента",
  "an.declinedExcluded": "Без отказаните поръчки",
  "an.quotePending": "{n} още чакат оферта",
  "an.orders": "Поръчки",
  "an.clients": "Клиенти",
  "an.avgOrder": "Средна поръчка",
  "an.awaiting": "Чакат преглед",
  "an.ordersPerMonth": "Поръчки по месеци",
  "an.revenuePerMonth": "Плащания по месеци",
  "an.byCategory": "Поръчки по категория",
  "an.byStatus": "Етап на производство",
  "an.last12": "Последните 12 месеца",
  "an.tableView": "Таблица",
  "an.month": "Месец",
  "an.noData": "Все още няма поръчки.",

  // готови модели
  "adminnav.ready": "Готови модели",
  "ready.title": "Готови модели",
  "ready.sub":
    "Завършени дрехи на закачалката, готови за днес. Поръчките по мярка си остават в „Поръчки“ — тук е само това, което вече е ушито.",
  "ready.newPiece": "Нов модел",
  "ready.newTitle": "Добави готов модел",
  "ready.editTitle": "Редактирай готов модел",
  "ready.name": "Модел",
  "ready.namePlaceholder": "напр. Маслинен карго комплект",
  "ready.category": "Категория",
  "ready.size": "Размер",
  "ready.price": "Цена (€)",
  "ready.addedOn": "Завършен на",
  "ready.status": "Статус",
  "ready.heldFor": "Запазен за",
  "ready.soldTo": "Продаден на",
  "ready.notes": "Бележки",
  "ready.photos": "Снимки (до {max})",
  "ready.removePhoto": "Премахни снимката",
  "ready.save": "Запази модела",
  "ready.status.available": "На закачалката",
  "ready.status.reserved": "Запазен",
  "ready.status.sold": "Продаден",
  "ready.oneSize": "Универсален",
  "ready.noPrice": "Без цена",
  "ready.heldForName": "Запазен за {name}",
  "ready.soldToName": "Продаден на {name}",
  "ready.edit": "Редактирай",
  "ready.delete": "Изтрий",
  "ready.confirmDelete": "Да изтрия ли този модел?",
  "ready.filter.all": "Всички",
  "ready.empty": "Все още няма нищо на закачалката. Натиснете „+ Нов модел“.",
  "ready.emptyFilter": "Няма модели с този статус.",
  "ready.stat.onRail": "На закачалката",
  "ready.stat.reserved": "Запазени",
  "ready.stat.sold": "Продадени",
  "ready.stat.stockValue": "Стойност на наличността",

  // разходи
  "exp.income": "Приходи",
  "exp.spend": "Разходи",
  "exp.net": "Остава",
  "exp.missingDocs": "Липсващи документи",
  "exp.reconTitle": "Откъде идва тази сума",
  "exp.fromOrders": "Приети поръчки",
  "exp.fromReady": "Продадени готови модели",
  "exp.reconNote":
    "Отказаните поръчки и непродадените модели не влизат. Поръчките се броят от деня на заявката, готовите модели — от деня, в който са отбелязани като продадени.",
  "exp.missingCallout":
    "{n} разхода за {value} са без приложен документ. Разход без документ не може да се признае — потърсете фактурите, преди да приключи годината.",
  "exp.perMonth": "Разходи по месеци",
  "exp.byCategory": "Разходи по категория",
  "exp.listTitle": "Всички разходи",
  "exp.listSub": "{n} записани.",
  "exp.filterMissing": "Без документ",
  "exp.newExpense": "Нов разход",
  "exp.empty": "Все още няма записани разходи.",
  "exp.emptyFilter": "Всеки разход си има документ. Няма какво да гоните.",
  "exp.newTitle": "Запиши разход",
  "exp.editTitle": "Редактирай разход",
  "exp.date": "Дата",
  "exp.category": "Категория",
  "exp.vendor": "Доставчик",
  "exp.vendorPlaceholder": "На кого е платено",
  "exp.description": "За какво",
  "exp.amount": "Сума (€)",
  "exp.document": "Документ",
  "exp.onFile": "Приложен",
  "exp.noDocument": "Няма",
  "exp.hasDocument": "Фактурата или бележката е приложена",
  "exp.hasDocumentHint":
    "Ако махнете отметката, разходът се отбелязва, докато документът се появи.",
  "exp.documentNo": "№ на документа",
  "exp.save": "Запази разхода",
  "exp.badAmount": "Въведете сума, по-голяма от нула.",
  "exp.cat.materials": "Платове и материи",
  "exp.cat.trims": "Аксесоари и конци",
  "exp.cat.equipment": "Машини и оборудване",
  "exp.cat.rent": "Наем",
  "exp.cat.utilities": "Ток, вода, интернет",
  "exp.cat.shipping": "Куриери",
  "exp.cat.packaging": "Опаковки и етикети",
  "exp.cat.marketing": "Реклама",
  "exp.cat.software": "Софтуер и абонаменти",
  "exp.cat.accounting": "Счетоводство",
  "exp.cat.socialSecurity": "Осигуровки",
  "exp.cat.taxes": "Данъци",
  "exp.cat.subcontract": "Подизпълнители",
  "exp.cat.transport": "Транспорт",
  "exp.cat.other": "Друго",

  // административни документи
  "doc.status": "Статус",
  "doc.details": "Подробности",
  "doc.notes": "Бележки",
  "doc.notesPlaceholder": "Номера, кой го движи, къде е подреден…",
  "doc.dueOn": "Срок",
  "doc.remove": "Премахни",
  "doc.section": "Раздел",
  "doc.stat.done": "Готови",
  "doc.stat.outstanding": "Остават",
  "doc.stat.notApplicable": "Не се отнасят",
  "doc.disclaimer":
    "Работен списък, а не данъчен или правен съвет. Сумите и сроковете тук са тези в сила през 2026 г. — потвърдете със счетоводителя си всичко, по което ще действате, и отбележете като „Не се отнася“ това, което не важи за вас.",
  "doc.status.todo": "Предстои",
  "doc.status.in_progress": "В процес",
  "doc.status.done": "Готово",
  "doc.status.na": "Не се отнася",
  "doc.every.once": "Еднократно",
  "doc.every.monthly": "Месечно",
  "doc.every.annual": "Годишно",
  "doc.group.setup": "Регистрация и основи",
  "doc.group.setup.sub": "Ателието на хартия.",
  "doc.group.tax": "Данъци и ДДС",
  "doc.group.tax.sub": "Фактури, прагове и годишните подавания.",
  "doc.group.social": "Осигуряване",
  "doc.group.social.sub":
    "Вашите осигуровки като самоосигуряващо се лице.",
  "doc.group.consumer": "Продажби и потребители",
  "doc.group.consumer.sub": "Продажба на потребители — онлайн и на място.",
  "doc.group.product": "Продукт и марка",
  "doc.group.product.sub": "Дрехите и името върху тях.",
  "doc.group.data": "Лични данни",
  "doc.group.data.sub": "Мерки, контакти и адреси на клиентите.",
  "doc.addTitle": "Добавете свое",
  "doc.addSub": "Нещо специфично за ателието, което списъкът горе изпуска.",
  "doc.newTitleLabel": "Какво трябва да се свърши",
  "doc.newTitlePlaceholder": "напр. Подновяване на противопожарното становище",
  "doc.add": "Добави",

  "doc.company.title": "Регистрирана дейност (ЕИК)",
  "doc.company.desc":
    "Фирма в Търговския регистър или регистрация в БУЛСТАТ, ако работите на свободна практика. Номерът стои на всяка издадена фактура.",
  "doc.bank.title": "Банкова сметка за бизнеса",
  "doc.bank.desc":
    "Държи парите на ателието отделно от личните. Счетоводителят работи по тези извлечения, а от 1 януари 2026 г. всичко е в евро.",
  "doc.accountant.title": "Нает счетоводител",
  "doc.accountant.desc":
    "Декларации обр. 1 и 6 се подават в НАП всеки месец. Почти всички срокове по-долу са негова работа — но документите са ваша грижа и трябва да стигат навреме.",
  "doc.lease.title": "Договор за наем на ателието",
  "doc.lease.desc":
    "Подписан договор за помещението плюс месечната фактура от наемодателя, подредена при останалите разходи.",
  "doc.insurance.title": "Застраховка на ателието",
  "doc.insurance.desc":
    "По желание. Покрива машините, наличността на закачалката и самото помещение. Струва си да се остойности, когато на закачалката има реална стойност.",

  "doc.okd5.title": "Подадена ОКД-5 в НАП",
  "doc.okd5.desc":
    "Регистрира ви като самоосигуряващо се лице. Подава се до 7 дни от започване на дейността — при закъснение губите правото на обезщетение за болест и майчинство за този период.",
  "doc.contributions.title": "Месечни осигуровки",
  "doc.contributions.desc":
    "Плащат се върху избрания осигурителен доход до 25-о число на следващия месец. Нещото, по което най-често се изостава.",

  "doc.invoices.title": "Издадени и подредени фактури",
  "doc.invoices.desc":
    "Последователна номерация без пропуски, в евро, с вашия ЕИК на всяка. Пазете копията — те доказват приходите в раздел „Пари“.",
  "doc.vatThreshold.title": "Следене на прага за ДДС",
  "doc.vatThreshold.desc":
    "Регистрацията става задължителна при облагаем оборот над 51 130 € за календарната година, а оттам имате 7 дни да подадете заявление. Проверявайте текущия сбор всеки месец.",
  "doc.fiscal.title": "Касов апарат или фискално устройство",
  "doc.fiscal.desc":
    "Задължително в момента, в който приемате плащане в брой, с карта или наложен платеж. Само банков превод е изключение — затова много малки ателиета работят с фактура и превод.",
  "doc.annualReturn.title": "Годишна данъчна декларация",
  "doc.annualReturn.desc":
    "Фирмите подават по чл. 92 ЗКПО между 1 март и 30 юни. Като ЕТ или физическо лице подавате по чл. 50 ЗДДФЛ.",
  "doc.gfo.title": "Обявен годишен финансов отчет",
  "doc.gfo.desc":
    "ГФО се обявява в Търговския регистър до 30 септември, отделно от данъчната декларация. Пропускът се глобява дори в година без дейност.",

  "doc.eshop.title": "Деклариран електронен магазин в НАП",
  "doc.eshop.desc":
    "Изисква се по Наредба Н-18, преди да приемате онлайн поръчки, за които се издава бележка. Не е нужно, докато сайтът само събира запитвания и часове за проба.",
  "doc.terms.title": "Общи условия, връщане и 14-те дни",
  "doc.terms.desc":
    "При онлайн покупка клиентът има 14 дни да се откаже — но дреха, ушита по негови мерки, е изключение. Готов модел от закачалката не е, затова го напишете ясно.",

  "doc.labelling.title": "Етикети със състав",
  "doc.labelling.desc":
    "Всяка дреха носи състава си на български, върху траен етикет. Символите за поддръжка по обичай вървят с него.",
  "doc.trademark.title": "Марка за името",
  "doc.trademark.desc":
    "По желание. Регистрация на Tidote в Патентното ведомство покрива България, EUIPO — целия ЕС. Най-евтино е, преди някой друг да поиска името.",

  "doc.privacy.title": "Политика за поверителност на сайта",
  "doc.privacy.desc":
    "Съхранявате мерки, контакти и адреси — всичко това са лични данни. Опишете какво събирате, защо, колко го пазите и как човек може да го поиска обратно.",
  "doc.processingRegister.title": "Регистър на дейностите по обработване",
  "doc.processingRegister.desc":
    "Вътрешен опис какви данни държите и на какво основание. Кратък документ, но първият, който проверяващият иска. Преглеждайте го веднъж годишно.",

  // admin shell / dashboard
  "admin.group.clients": "Клиенти",
  "admin.group.orders": "Поръчки",
  "admin.group.studio": "Ателие",
  "admin.allClients": "Всички клиенти",
  "admin.search": "Търси по име, телефон, имейл…",
  "admin.newClient": "Нов клиент",
  "admin.stat.clientsCount": "Клиенти",
  "admin.stat.totalOrders": "Общо поръчки",
  "admin.stat.inProgress": "В процес",
  "admin.stat.revenue": "Оборот",
  "admin.clientsEmpty": "Все още няма клиенти. Натиснете „+ Нов клиент“.",
  "admin.col.client": "Клиент",
  "admin.col.phone": "Телефон",
  "admin.col.orders": "Поръчки",
  "admin.col.last": "Последна",
  "admin.ordersInCategory": "{n} поръчки в тази категория.",
  "admin.allOrders": "Всички",
  "admin.allOrdersTitle": "Всички поръчки",
  "admin.ordersTotal": "{n} поръчки общо.",
  "newclient.title": "Нов клиент",
  "newclient.name": "Име",
  "newclient.email": "Имейл",
  "newclient.phone": "Телефон",
  "newclient.password": "Временна парола",
  "newclient.create": "Създай клиент",
  "newclient.cancel": "Отказ",
  "newclient.dupEmail": "Вече съществува клиент с този имейл.",
  "newclient.badInput": "Име, имейл и парола от поне 8 знака.",
  "newclient.failed":
    "Профилът не беше създаден. Няма нищо недовършено — опитай отново.",

  // client roster
  "roster.orders": "{n} поръчки",
  "roster.measured": "Мерки от {date}",
  "roster.noMeasure": "Още няма мерки",
  "roster.none": "Все още няма клиенти.",

  // inbox
  "inbox.title": "Съобщения",
  "inbox.sub": "Всички разговори с клиенти на едно място.",
  "inbox.select": "Изберете разговор, за да четете и отговаряте.",
  "inbox.noMessages": "Все още няма съобщения.",
  "inbox.you": "Вие: ",

  // calendar
  "cal.title": "Календар за проби",
  "cal.sub":
    "Пробите следват седмичното ви разписание. Променете конкретна дата по-долу, когато имате изключение, и вижте крайните срокове и записаните проби с един поглед.",
  "cal.back": "← Обратно към обзора",
  "cal.selectDate":
    "Изберете дата, за да я отворите или затворите и да управлявате часовете за проби.",
  "cal.openDay": "Отвори деня",
  "cal.closeDay": "Затвори деня",
  "cal.addSlot": "Добави час",
  "cal.remove": "Премахни",
  "cal.noSlots": "Все още няма свободни часове.",
  "cal.bookedFittings": "Записани проби",
  "cal.customDay": "Зададен ръчно за тази дата.",
  "cal.followingWeekly": "Следва седмичното разписание.",
  "cal.useWeekly": "Върни към разписанието",
  "cal.legend.open": "По разписание",
  "cal.legend.custom": "Ръчно променен",
  "cal.legend.orderDue": "Краен срок",
  "cal.legend.booked": "Записана проба",

  // седмично разписание
  "hours.title": "Седмично разписание",
  "hours.sub":
    "Стандартните часове за проби. Всяка дата следва това разписание, докато не промените самата дата в календара.",
  "hours.restore": "Върни по подразбиране",
  "hours.from": "от",
  "hours.to": "до",
  "hours.closed": "Затворено",
  "hours.tooShort": "Твърде кратък интервал",
  "hours.slotCount": "{n} часа",
  "hours.slotLength": "Времетраене на проба",
  "hours.minutes": "{n} мин",
  "hours.overrideNote":
    "Промяна на конкретна дата в календара важи само за нея — седмичното разписание остава непроменено.",
  "picker.readyBook": "Готова за проба — запазете час",
  "picker.pickDay": "Изберете маркиран ден, за да видите свободните часове.",

  // notifications
  "notif.title": "Известия",
  "notif.markAll": "Отбележи всички",
  "notif.empty": "Няма нищо ново засега.",
  "notif.justNow": "току-що",
  "notif.mAgo": "преди {n} мин",
  "notif.hAgo": "преди {n} ч",
  "notif.dAgo": "преди {n} дни",

  // messages
  "msg.empty": "Все още няма съобщения — напишете първото!",
  "msg.placeholder": "Напишете съобщение…",
  "msg.send": "Изпрати",

  // photo thumb
  "thumb.noPhoto": "Без снимка",

  // admin client
  "adminclient.profile": "Клиентски профил",
  "adminclient.orders": "Поръчки",
  "adminclient.measurements": "Мерки",
  "adminclient.notProvided": "Все още не са попълнени.",
  "adminclient.lastUpdated": "Последна промяна: {date}.",
  "adminclient.fitNotes": "Бележки за прилягането",
  "adminclient.delivery": "Данни за доставка",
  "adminclient.noAddress": "Няма въведен адрес.",
  "adminclient.messages": "Съобщения",
  "adminclient.replyHint":
    "Отговорете на {name} тук — ще види отговора ви в профила си.",
  "adminclient.msgPlaceholder": "Съобщение до {name}…",
  "adminclient.notFound": "Клиентът не е намерен.",
  "adminclient.back": "Обратно към обзора",
  "common.close": "Затвори",
  "common.cancel": "Отказ",

  "photos.title": "Снимки на вашата дреха",
  "photos.sub":
    "Носите ли я? Добавете свои снимки тук. Остават само между вас и ателието, освен ако не решите друго по-долу.",
  "photos.adminTitle": "Снимки от клиента",
  "photos.adminSub": "Качени от клиента през неговия профил.",
  "photos.upload": "Добави снимки",
  "photos.remove": "Премахни снимката",
  "photos.view": "Виж снимка {n}",
  "photos.consent":
    "Tidote Atelier може да използва тези снимки, за да показва работата си — сайт, социални мрежи и лукбукове.",
  "photos.consentOn": "Включено на {date}. Може да го изключите по всяко време.",
  "photos.consentOff": "Изключено. Снимките остават само за ателието.",
  "photos.mayUse": "Клиентът се съгласи на {date} снимките да бъдат използвани публично.",
  "photos.mayNotUse": "Не за публикуване. Клиентът не е дал съгласие за тези снимки.",

  "ret.title": "Връщане",
  "ret.mark": "Отбележи като върната",
  "ret.explain":
    "Дрехата се връща в ателието. Излиза от гардероба на клиента и спира да се брои като приход.",
  "ret.toStock": "Сложи я на закачалката като „Готови модели“",
  "ret.confirm": "Потвърди връщането",
  "ret.returnedOn": "Върната на {date}.",
  "ret.undo": "Отмени връщането",
  "ret.undoKeptStock":
    "Моделът вече е продаден, затова остава в готовите модели. Ако това е грешка, премахнете го ръчно от „Готови модели“.",
  "ret.clientNotice":
    "Тази дреха е върната в ателието на {date}.",
  "order.returned": "Върната",

  "gen.notif.returned": "Връщането на {piece} е отбелязано.",
  "delclient.action": "Изтрий клиента",
  "delclient.title": "Да изтрием ли {name}?",
  "delclient.intro": "Това премахва клиента и всичко, заведено към него:",
  "delclient.lossOrders": "{n} поръчки, заедно с бележките, снимките и цените",
  "delclient.lossMeasurements": "Мерките и данните за доставка",
  "delclient.lossMessages": "{n} съобщения в разговора с ателието",
  "delclient.lossItems": "{n} референтни дрехи в гардероба",
  "delclient.activeWarning":
    "Внимание — {n} от поръчките му са още в процес. Изтриването няма да го уведоми.",
  "delclient.irreversible":
    "Действието е необратимо и клиентът повече няма да може да влиза в профила си.",
  "delclient.typeName": "Напишете „{name}“, за да потвърдите",
  "delclient.confirm": "Изтрий завинаги",
  "delclient.cancel": "Отказ",

  // generated messages + notifications
  "gen.msg.accepted":
    "Страхотна новина — поръчката ви за „{piece}“ е приета! Цена: {total}. Ще ви държим в течение, докато дрехата премине през производството.",
  "gen.msg.denied":
    "Съжаляваме, но в момента не можем да поемем поръчката ви за „{piece}“.{reason}",
  "gen.notif.orderPlaced": "{name} направи нова поръчка: „{piece}“.",
  "gen.notif.acceptedClient": "Поръчката ви „{piece}“ е приета ({total}).",
  "gen.notif.deniedClient": "Поръчката ви „{piece}“ е отказана.",
  "gen.notif.statusChanged": "Статусът на „{piece}“ е обновен: {status}.",
  "gen.notif.deadline": "Нова очаквана дата за „{piece}“: {eta}.",
  "gen.notif.msgFromClient": "{name} ви изпрати съобщение.",
  "gen.notif.msgFromStudio": "Ателието ви изпрати съобщение.",
  "gen.notif.wardrobeAdded": "Ателието добави „{piece}“ в гардероба ви.",
  "gen.notif.noteFromClient": "{name} добави информация към „{piece}“.",
  "gen.notif.noteFromStudio": "Ателието добави бележка към „{piece}“.",
  "auth.badLogin": "Имейлът или паролата не са верни.",
  "auth.noBackend":
    "Сайтът още не е свързан с базата данни, така че никой не може да влезе. Вижте SETUP.md.",
  "auth.unreachable":
    "Няма връзка с базата данни. Проверете интернет връзката и опитайте отново.",

  // Имена на модели, които ателието използва често.
  "piece.Burgundy Track Jacket": "Бордо спортно яке",
  "piece.Olive Cargo Set": "Маслинен карго комплект",
  "piece.Black Puffer Jacket": "Черно яке пухенка",
  "piece.Gold Graphic Hoodie": "Златист суитшърт с щампа",
  "piece.Mint Track Pants": "Ментови спортни панталони",
  "piece.Panelled Track Jacket": "Спортно яке с панели",
  "piece.Reworked Graphic Tee": "Преработена тениска с щампа",

};

export const DICT: Record<Lang, Dict> = { en, bg };

export function translate(
  lang: Lang,
  key: string,
  params?: Record<string, string | number>
): string {
  let str = DICT[lang][key] ?? DICT.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replaceAll(`{${k}}`, String(v));
    }
  }
  return str;
}

function isLang(value: unknown): value is Lang {
  return value === "en" || value === "bg";
}

/** The language the browser asks for, ignoring any choice the visitor saved. */
export function detectBrowserLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const tags = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  return tags.some((tag) => tag?.toLowerCase().startsWith("bg")) ? "bg" : "en";
}

/**
 * The visitor's language, in precedence order: a choice they made here, then
 * what their browser asks for, then English.
 *
 * A detected language is deliberately not written back to storage — only an
 * explicit pick via the header toggle is, so a visitor who never chooses keeps
 * following their browser rather than being frozen on first-visit detection.
 *
 * The pre-hydration snippet in the root layout resolves this same order; the
 * two must stay in step or <html lang> and the rendered copy would disagree.
 */
export function getStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const raw = window.localStorage.getItem(LANG_KEY);
    if (isLang(raw)) return raw;
  } catch {
    // Storage can throw when the browser blocks it (private mode, embedded
    // contexts). Fall through to detection rather than taking the page down.
  }
  return detectBrowserLang();
}

export function setStoredLang(lang: Lang) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Non-fatal: the choice just won't survive a reload.
  }
}

// enum + demo-data helpers
export function statusLabel(lang: Lang, status: string): string {
  return translate(lang, `status.${status}`);
}

export function categoryLabel(lang: Lang, category: string): string {
  return translate(lang, `cat.${category}`);
}

export function pieceLabel(lang: Lang, piece: string): string {
  const key = `piece.${piece}`;
  if (DICT.en[key]) return translate(lang, key);
  return piece; // freeform client-typed piece names pass through
}

/** Order notes are free text the client typed, so they pass through as written. */
export function orderNoteText(
  lang: Lang,
  orderId: string,
  note?: string
): string {
  if (!note) return "";
  return seedTextById(lang, `note-${orderId}`, note);
}

/**
 * What a person wrote, in the language they wrote it.
 *
 * This used to look demo content up by its fixed seed id so both languages had
 * a version of it. Everything is real content out of the database now — a
 * message, a note, a line about a piece — and translating what someone actually
 * typed would be wrong, so it is returned as written.
 */
export function seedTextById(_lang: Lang, _id: string, text: string): string {
  return text;
}
