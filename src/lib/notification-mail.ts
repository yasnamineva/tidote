import type { NotificationKind } from "@/lib/mock-data";

/**
 * Which events reach someone's inbox, and what they say there.
 *
 * Every event in the portal already raises a notification — nine of them — and
 * for a long time that was all it did. A bell is only seen by someone who
 * opens the website, so a client learned their jacket was ready by wondering
 * and checking. That is not a notification, it is a noticeboard.
 *
 * So this sits beside the bell rather than anywhere else: the one function
 * that writes a notification now also asks for this, which makes it hard to
 * add an event that rings one and not the other. Adding a kind here is a
 * conscious decision either way — `null` means "the bell is enough", and the
 * three that return null say why.
 *
 * Written from the kind and its data rather than from the notification's own
 * sentence, because that sentence was composed in whatever language the person
 * who caused it happened to be using. The recipient gets their own.
 */

export type MailLang = "bg" | "en";

export type NotificationData = {
  /** The piece, already in a readable form. */
  piece?: string;
  /**
   * For a stage change: the raw key (`ready`, `shipped`…), named by this
   * module in the reader's language. For a review: `accepted` or `declined`.
   */
  status?: string;
  /** For an accepted order. */
  total?: string;
  /** Who it is about, for the studio's own mail. */
  client?: string;
};

export type RenderedMail = { subject: string; text: string };

const SITE = "https://tidoteatelier.com";

/**
 * The stages, named here rather than taken from the notification.
 *
 * The alert's own sentence was built with the studio's language, so reusing it
 * would send "Готова за проба" to someone reading the site in English. The
 * alert carries the raw key instead and this turns it into words — the same
 * five as `status.*` in the translations, kept in step by the test that walks
 * both lists.
 */
const STATUS_WORDS: Record<MailLang, Record<string, string>> = {
  bg: {
    received: "приета",
    in_production: "в производство",
    ready: "готова за проба",
    shipped: "изпратена",
    delivered: "доставена",
  },
  en: {
    received: "received",
    in_production: "in production",
    ready: "ready for a fitting",
    shipped: "shipped",
    delivered: "delivered",
  },
};

function stage(lang: MailLang, key: string | undefined): string | undefined {
  if (!key) return undefined;
  return STATUS_WORDS[lang][key];
}

const COPY = {
  bg: {
    greeting: (name: string) => (name ? `Здравейте, ${name},` : "Здравейте,"),
    signOff: "— Tidote Atelier",
    seeIt: (href: string) => `Вижте го тук: ${SITE}${href}`,
    noReply:
      "Това писмо е за поръчката ви. Ако не искате повече писма от ателието, спрете ги от профила си — известията за собствените ви поръчки продължават.",
    accepted: (d: NotificationData) => ({
      subject: `Поръчката ви е приета${d.piece ? ` — ${d.piece}` : ""}`,
      body: [
        `Ателието прие поръчката ви${d.piece ? ` за ${d.piece}` : ""}.`,
        d.total ? `Цена: ${d.total}.` : null,
        "Ще започнем работа и ще ви държим в течение.",
      ],
    }),
    declined: (d: NotificationData) => ({
      subject: `За поръчката ви${d.piece ? ` — ${d.piece}` : ""}`,
      body: [
        `За съжаление ателието не може да поеме поръчката ви${d.piece ? ` за ${d.piece}` : ""} в момента.`,
        "Отворете поръчката, за да видите причината — и ни пишете, ако има как да я направим иначе.",
      ],
    }),
    status: (d: NotificationData) => ({
      subject: `${d.piece ?? "Поръчката ви"}: ${d.status ?? "има промяна"}`,
      body: [
        `${d.piece ? `${d.piece} —` : "Поръчката ви —"} ${d.status ?? "има промяна"}.`,
      ],
    }),
    note: (d: NotificationData) => ({
      subject: `Бележка по поръчката${d.piece ? ` — ${d.piece}` : ""}`,
      body: ["Ателието добави бележка по поръчката ви."],
    }),
    message: () => ({
      subject: "Съобщение от ателието",
      body: ["Ателието ви писа."],
    }),
    // For the studio herself.
    placed: (d: NotificationData) => ({
      subject: `Нова поръчка${d.client ? ` от ${d.client}` : ""}`,
      body: [
        `${d.client ?? "Клиент"} направи поръчка${d.piece ? ` за ${d.piece}` : ""}.`,
        "Отворете я, за да я прегледате и да дадете цена.",
      ],
    }),
    fromClient: (d: NotificationData) => ({
      subject: `Съобщение от ${d.client ?? "клиент"}`,
      body: [`${d.client ?? "Клиент"} ви писа.`],
    }),
  },
  en: {
    greeting: (name: string) => (name ? `Hello ${name},` : "Hello,"),
    signOff: "— Tidote Atelier",
    seeIt: (href: string) => `See it here: ${SITE}${href}`,
    noReply:
      "This is about your order. If you would rather not hear from the atelier otherwise, you can stop that from your account — notices about your own orders carry on.",
    accepted: (d: NotificationData) => ({
      subject: `Your order is accepted${d.piece ? ` — ${d.piece}` : ""}`,
      body: [
        `The atelier has accepted your order${d.piece ? ` for ${d.piece}` : ""}.`,
        d.total ? `Price: ${d.total}.` : null,
        "Work starts now, and you will hear as it moves.",
      ],
    }),
    declined: (d: NotificationData) => ({
      subject: `About your order${d.piece ? ` — ${d.piece}` : ""}`,
      body: [
        `The atelier cannot take on your order${d.piece ? ` for ${d.piece}` : ""} at the moment.`,
        "Open it to see why — and write to us if there is another way to make it.",
      ],
    }),
    status: (d: NotificationData) => ({
      subject: `${d.piece ?? "Your order"}: ${d.status ?? "has moved on"}`,
      body: [
        `${d.piece ? `${d.piece} —` : "Your order —"} ${d.status ?? "has moved on"}.`,
      ],
    }),
    note: () => ({
      subject: "A note on your order",
      body: ["The atelier has added a note to your order."],
    }),
    message: () => ({
      subject: "A message from the atelier",
      body: ["The atelier has written to you."],
    }),
    placed: (d: NotificationData) => ({
      subject: `New order${d.client ? ` from ${d.client}` : ""}`,
      body: [
        `${d.client ?? "A client"} has placed an order${d.piece ? ` for ${d.piece}` : ""}.`,
        "Open it to review it and set a price.",
      ],
    }),
    fromClient: (d: NotificationData) => ({
      subject: `Message from ${d.client ?? "a client"}`,
      body: [`${d.client ?? "A client"} has written to you.`],
    }),
  },
} as const;

/**
 * The email for a notification, or null when the bell is enough.
 *
 * Silent on purpose:
 *   wardrobe_added — the studio filing a photograph of something they already
 *                    own is a tidy-up, not news.
 *   enquiry        — already emailed by the route that files it, with the
 *                    message itself in the body, which this cannot see.
 */
export function renderNotificationMail(input: {
  kind: NotificationKind;
  audience: "client" | "admin";
  href: string;
  data: NotificationData;
  recipientName: string;
  lang: MailLang;
}): RenderedMail | null {
  const c = COPY[input.lang];
  const { kind, audience, data } = input;

  let part: { subject: string; body: (string | null)[] } | null = null;

  if (audience === "client") {
    if (kind === "order_reviewed") {
      // The two halves of the same event; `status` carries which it was.
      part = data.status === "declined" ? c.declined(data) : c.accepted(data);
    } else if (kind === "status_changed") {
      part = c.status({ ...data, status: stage(input.lang, data.status) });
    }
    else if (kind === "order_note") part = c.note(data);
    else if (kind === "message") part = c.message();
  } else {
    if (kind === "order_placed") part = c.placed(data);
    else if (kind === "message") part = c.fromClient(data);
  }

  if (!part) return null;

  const text = [
    c.greeting(input.recipientName),
    "",
    ...part.body.filter((line): line is string => Boolean(line)),
    "",
    c.seeIt(input.href),
    "",
    c.signOff,
    "",
    c.noReply,
  ].join("\n");

  return { subject: part.subject, text };
}
