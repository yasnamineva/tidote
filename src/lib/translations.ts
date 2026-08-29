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
  "header.login": "Login / Track Order",
  "header.account": "My Account",
  "header.studioAdmin": "Studio Admin",

  // footer
  "footer.tagline":
    "The anTIDOTE to mediocrity. Unique streetstyle to match your main character energy.",
  "footer.explore": "Explore",
  "footer.shop": "Shop",
  "footer.connect": "Connect",
  "footer.rights": "© {year} Tidote Atelier. All rights reserved.",

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

  // gallery
  "gallery.eyebrow": "Straight From Instagram",
  "gallery.follow": "Follow",

  // login
  "login.eyebrow": "Client Access",
  "login.title": "LOGIN TO TRACK YOUR ORDER",
  "login.email": "Email",
  "login.password": "Password",
  "login.submit": "Login",
  "login.useClientDemo": "Use client demo",
  "login.useAdminDemo": "Use admin demo",
  "login.demoNote":
    "This is a prototype login for design review. Demo credentials —",
  "login.demoClient": "client",
  "login.demoAdmin": "admin",
  "login.back": "← Back to home",

  // common
  "common.loading": "Loading…",
  "common.loadingAccount": "Loading account…",

  // dashboard
  "dash.myAccount": "My Account",
  "dash.welcome": "Welcome back, {name}",
  "dash.logout": "Log Out",
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
    "Add pieces you already own so the atelier can reference your style and fit.",
  "wardrobe.adminTitle": "Wardrobe — Reference",
  "wardrobe.adminSub":
    "Pieces this client already owns, for style and fit reference.",
  "wardrobe.empty":
    "No items yet. Add pieces you already own so we can reference them.",
  "wardrobe.emptyAdmin": "This client hasn't added any items yet.",
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
  "neworder.warnLarge": "\"{name}\" is too large (max 1.5MB) — skipped.",

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
  "adminnav.logout": "Log Out",
  "an.title": "Analytics",
  "an.sub": "How the studio is doing, at a glance.",
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
    "Open or close days, add fitting slots, and see order due-dates and booked fittings at a glance.",
  "cal.back": "← Back to Overview",
  "cal.selectDate":
    "Select a date to open/close it and manage fitting slots.",
  "cal.openDay": "Open Day",
  "cal.closeDay": "Close Day",
  "cal.addSlot": "Add Slot",
  "cal.remove": "Remove",
  "cal.noSlots": "No open slots yet.",
  "cal.bookedFittings": "Booked Fittings",
  "cal.legend.open": "Open",
  "cal.legend.orderDue": "Order due",
  "cal.legend.booked": "Fitting booked",
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
  "gen.notif.noteFromClient": "{name} added info to \"{piece}\".",
  "gen.notif.noteFromStudio": "The studio added a note to \"{piece}\".",
  "auth.badLogin": "That email/password doesn't match our records.",

  // seed pieces
  "piece.Burgundy Track Jacket": "Burgundy Track Jacket",
  "piece.Olive Cargo Set": "Olive Cargo Set",
  "piece.Black Puffer Jacket": "Black Puffer Jacket",
  "piece.Gold Graphic Hoodie": "Gold Graphic Hoodie",
  "piece.Mint Track Pants": "Mint Track Pants",
  "piece.Panelled Track Jacket": "Panelled Track Jacket",
  "piece.Reworked Graphic Tee": "Reworked Graphic Tee",

  // seed messages / notifications (by id)
  "seed.msg-seed-dimitar-1":
    "Welcome back, Dimitar! Message us here anytime about fabric, fit, or timing.",
  "seed.msg-seed-boris-1":
    "Hi Boris — glad to have you back in the atelier. Let us know if you need anything.",
  "seed.msg-seed-kaloyan-1":
    "Welcome to Tidote Atelier, Kaloyan! Feel free to ask us anything here.",
  "seed.ntf-seed-admin-1": "Kaloyan sent you a message.",
  "seed.ntf-seed-dimitar-1":
    "Your Gold Graphic Hoodie is ready for a fitting — book a slot.",

  // seed order notes (client-typed text; only the demo ones are translatable)
  "seed.note-TD-1042": "Burgundy panelling, custom shoulder taping.",
  "seed.note-TD-1058": "Waiting on fabric confirmation.",
  "seed.note-TD-1065":
    "Fabric arrived — book your fitting whenever works for you.",
};

const bg: Dict = {
  // chrome / nav
  "header.tagline": "По поръчка · София",
  "nav.casual": "Ежедневни",
  "nav.sports": "Спортни",
  "nav.about": "За нас",
  "nav.how": "Как работим",
  "nav.gallery": "Галерия",
  "header.login": "Вход",
  "header.account": "Моят профил",
  "header.studioAdmin": "Админски панел",

  // footer
  "footer.tagline":
    "Антидотът срещу посредствеността. Уникален streetwear стил за мъже, които не остават незабелязани.",
  "footer.explore": "Разгледай",
  "footer.shop": "Магазин",
  "footer.connect": "Контакти",
  "footer.rights": "© {year} Tidote Atelier. Всички права запазени.",

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

  // gallery
  "gallery.eyebrow": "Директно от Instagram",
  "gallery.follow": "Instagram",

  // login
  "login.eyebrow": "Достъп за клиенти",
  "login.title": "ВЛЕЗТЕ, ЗА ДА ПРОСЛЕДИТЕ ПОРЪЧКАТА СИ",
  "login.email": "Имейл",
  "login.password": "Парола",
  "login.submit": "Вход",
  "login.useClientDemo": "Демо клиент",
  "login.useAdminDemo": "Демо админ",
  "login.demoNote":
    "Това е примерен вход за преглед на дизайна. Демо данни —",
  "login.demoClient": "клиент",
  "login.demoAdmin": "админ",
  "login.back": "← Обратно към началото",

  // common
  "common.loading": "Зареждане…",
  "common.loadingAccount": "Зареждане на профила…",

  // dashboard
  "dash.myAccount": "Моят профил",
  "dash.welcome": "Добре дошли, {name}",
  "dash.logout": "Изход",
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
    "Добавете модели, които вече притежавате, за да може ателието да се ориентира по вашия стил и кройка.",
  "wardrobe.adminTitle": "Гардероб — референция",
  "wardrobe.adminSub":
    "Модели, които клиентът вече притежава — за ориентир по стил и кройка.",
  "wardrobe.empty":
    "Все още няма модели. Добавете дрехи, които вече притежавате, за да ги ползваме за ориентир.",
  "wardrobe.emptyAdmin": "Този клиент все още не е добавил модели.",
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
  "neworder.warnLarge": "„{name}“ е твърде голяма (макс. 1.5MB) — пропусната.",

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
  "adminnav.logout": "Изход",
  "an.title": "Анализи",
  "an.sub": "Как върви ателието — накратко.",
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
    "Отваряйте и затваряйте дни, добавяйте часове за проби и виждайте крайните срокове и записаните проби с един поглед.",
  "cal.back": "← Обратно към обзора",
  "cal.selectDate":
    "Изберете дата, за да я отворите или затворите и да управлявате часовете за проби.",
  "cal.openDay": "Отвори деня",
  "cal.closeDay": "Затвори деня",
  "cal.addSlot": "Добави час",
  "cal.remove": "Премахни",
  "cal.noSlots": "Все още няма свободни часове.",
  "cal.bookedFittings": "Записани проби",
  "cal.legend.open": "Отворен",
  "cal.legend.orderDue": "Краен срок",
  "cal.legend.booked": "Записана проба",
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
  "gen.notif.noteFromClient": "{name} добави информация към „{piece}“.",
  "gen.notif.noteFromStudio": "Ателието добави бележка към „{piece}“.",
  "auth.badLogin": "Имейлът или паролата не са верни.",

  // seed pieces
  "piece.Burgundy Track Jacket": "Бордо спортно яке",
  "piece.Olive Cargo Set": "Маслинен карго комплект",
  "piece.Black Puffer Jacket": "Черно яке пухенка",
  "piece.Gold Graphic Hoodie": "Златист суитшърт с щампа",
  "piece.Mint Track Pants": "Ментови спортни панталони",
  "piece.Panelled Track Jacket": "Спортно яке с панели",
  "piece.Reworked Graphic Tee": "Преработена тениска с щампа",

  // seed messages / notifications (by id)
  "seed.msg-seed-dimitar-1":
    "Добре дошли отново! Пишете ни тук по всяко време — за плат, кройка или срокове.",
  "seed.msg-seed-boris-1":
    "Радваме се да ви видим отново в ателието. Пишете ни, ако имате нужда от нещо.",
  "seed.msg-seed-kaloyan-1":
    "Добре дошли в Tidote Atelier! Питайте ни за всичко тук.",
  "seed.ntf-seed-admin-1": "Kaloyan ви изпрати съобщение.",
  "seed.ntf-seed-dimitar-1":
    "Вашият „Златист суитшърт с щампа“ е готов за проба — запазете час.",

  // seed order notes (client-typed text; only the demo ones are translatable)
  "seed.note-TD-1042": "Бордо панели, ръчно кантиране на раменете.",
  "seed.note-TD-1058": "Чакаме потвърждение за плата.",
  "seed.note-TD-1065":
    "Платът пристигна — запазете си час за проба, когато ви е удобно.",
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

/**
 * Order notes are free text the client typed, so they can't be translated —
 * except the seeded demo ones, which carry a `seed.note-<orderId>` entry.
 */
export function orderNoteText(
  lang: Lang,
  orderId: string,
  note?: string
): string {
  if (!note) return "";
  return seedTextById(lang, `note-${orderId}`, note);
}

export function seedTextById(
  lang: Lang,
  id: string,
  fallback: string
): string {
  const key = `seed.${id}`;
  if (DICT.en[key]) return translate(lang, key);
  return fallback; // generated (non-seed) content passes through
}
