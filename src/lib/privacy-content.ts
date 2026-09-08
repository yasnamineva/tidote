import type { Lang } from "@/lib/translations";

/**
 * The privacy notice, in both languages the site speaks.
 *
 * It lives here rather than in `translations.ts` because that file is a flat
 * dictionary of short interface strings; a document of forty paragraphs would
 * drown it. The shape below is deliberately small — headings, paragraphs and
 * bullet lists are all this needs.
 *
 * Everything it claims is a claim about code in this repository: the tables in
 * `supabase/migrations/0001_init.sql`, the buckets in `0003_storage.sql`, the
 * consent flag on `orders.photo_consent`, and the deletion cascade in
 * `src/app/api/clients/[id]/route.ts`. If the system changes, this changes.
 */

/**
 * Who the notice is *from*.
 *
 * Bulgarian law requires a trader to identify itself by its registered name
 * and company number, and a privacy notice has to say who the controller is
 * precisely enough that a person could send a legal letter to it. The English
 * side carries the transliterated name; the ЕИК is the identifier that is the
 * same in any alphabet.
 *
 * These are also what the footer prints, under the Electronic Commerce Act.
 */
export const CONTROLLER = {
  legalName: { en: "Teodora Linkova EOOD", bg: "„Теодора Линкова“ ЕООД" },
  companyNumber: "206444925",
  address: {
    en: "Elink Vrah 16, Sofia, Bulgaria",
    bg: "Елинк връх 16, София, България",
  },
  email: "support@tidoteatelier.com",
};

/** Shown as the effective date. Update it whenever the text below changes. */
export const PRIVACY_UPDATED = { en: "8 September 2026", bg: "8 септември 2026 г." };

type Block = string | { list: string[] };

export type PolicySection = {
  id: string;
  heading: string;
  blocks: Block[];
};

export type Policy = {
  eyebrow: string;
  title: string;
  updatedLabel: string;
  intro: string;
  sections: PolicySection[];
};

const en: Policy = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  updatedLabel: `Last updated ${PRIVACY_UPDATED.en}`,
  intro:
    "Tidote Atelier makes clothes to your measurements. Doing that means knowing your body, your address and what you ordered — and a made-to-measure atelier cannot pretend otherwise. This page says exactly what we hold, why, who else can see it, and how to make us delete it.",
  sections: [
    {
      id: "controller",
      heading: "1. Who is responsible for your data",
      blocks: [
        `The controller of your personal data is ${CONTROLLER.legalName.en} (UIC ${CONTROLLER.companyNumber}), trading as Tidote Atelier, ${CONTROLLER.address.en}.`,
        `For anything in this policy — a question, a correction, a request to delete your data — write to ${CONTROLLER.email}. A person reads that address, not a ticketing system.`,
        "We are a small atelier and are not required to appoint a Data Protection Officer. Your request goes to the studio directly.",
      ],
    },
    {
      id: "collect",
      heading: "2. What we collect",
      blocks: [
        "It depends entirely on whether you are just looking at the site or are a client with a portal account.",
        "**If you are only browsing.** We do not ask you for anything and you cannot type anything into this site without an account. Our host records ordinary technical data for every request — IP address, browser, the page asked for, the time — which is how any web server works and how attacks are noticed. We also count page views in aggregate (see section 6). None of this identifies you to us by name.",
        "**If you have a portal account,** we hold what the atelier needs to cut and deliver a garment:",
        {
          list: [
            "Account: your name, email address, telephone number, and the date the account was made.",
            "Measurements: height, shoulders, chest, natural and lower waist, upper arm, biceps, wrist, inseam, thigh, ankle, and any fitting notes.",
            "Delivery: street address, city, postal code, telephone, and delivery instructions.",
            "Orders: the piece, its category, the price, the dates, the stage it has reached, whether it was returned, and the studio's notes on it.",
            "Photographs: reference images attached to an order, pictures of your own wardrobe you upload, and photographs you take of a finished piece.",
            "Messages: what you and the atelier write to each other in the portal.",
            "Fittings: the date and time you booked.",
          ],
        },
        "We do not collect special categories of data — no health data, no biometric identifiers. Body measurements taken for tailoring are not health data. We never ask for and never store payment card details; payment is settled outside this website.",
        "Your account exists in one of two ways: you registered yourself, or the studio created it for you after measuring you in person and gave you the password. Either way the account is yours, holds the same things, and can be deleted on request.",
      ],
    },
    {
      id: "why",
      heading: "3. Why we use it, and our legal basis",
      blocks: [
        "Under the GDPR we must name a lawful basis for each use. Ours are:",
        {
          list: [
            "**To make and deliver what you ordered** — your measurements, address, order history and messages. Legal basis: performance of a contract with you (Art. 6(1)(b)). Without these there is no garment; this is not optional data.",
            "**To run your account** — signing you in, showing you your orders, letting you book a fitting. Legal basis: performance of a contract (Art. 6(1)(b)).",
            "**To show our work publicly** — photographs of a finished piece, on the website, in social media or a lookbook. Legal basis: your consent (Art. 6(1)(a)), given per order and withdrawable. See section 4.",
            "**To keep proper books** — records of what was sold, for how much, and when. Legal basis: a legal obligation under Bulgarian accounting and tax law (Art. 6(1)(c)).",
            "**To keep the site working and secure** — server logs and aggregate visit counts. Legal basis: our legitimate interest in a site that stays up and is not abused (Art. 6(1)(f)).",
          ],
        },
        "We do not profile you, we do not make automated decisions about you, and we do not sell, rent or trade your data to anybody, ever.",
      ],
    },
    {
      id: "photos",
      heading: "4. Photographs and the advertising toggle",
      blocks: [
        "Every photograph in the portal is private by default. It is stored in a bucket that is not publicly readable and can only be opened through a short-lived signed link issued to you or to the studio.",
        "When you upload photographs of a finished piece, there is a separate switch beside them: *Tidote Atelier may use these photos to show its work — website, social media and lookbooks.* It is off unless you turn it on, it is asked per order rather than once for everything, and the date you turned it on is recorded so we can show you what you agreed to.",
        "You may turn it off at any time, from the same place, without giving a reason. Turning it off stops any future use immediately. It cannot un-print a lookbook already printed or reach a repost somebody else made, so we will also take down what we still control — tell us and we will.",
        "Withdrawing this consent has no effect on anything else: your order, your account and your relationship with the atelier are untouched.",
        "The one exception is the public rail on our In Stock page, which shows photographs of garments — not of people, and never linked to a client's name. Sold pieces disappear from it entirely.",
      ],
    },
    {
      id: "recipients",
      heading: "5. Who else can see it",
      blocks: [
        "Only the studio, and the companies that run the machines this site sits on. Each of them acts on our instructions as a processor, under a data processing agreement:",
        {
          list: [
            "**Supabase** — the database, the login system and the photo storage. Hosted in Frankfurt, Germany.",
            "**Vercel** — hosting and delivery of the website itself, and the aggregate visit counter.",
            "**Hostinger** — our email, including the messages the system sends you about your account.",
          ],
        },
        "Beyond those, we disclose personal data only to our accountant for the records the law requires us to keep, and to a public authority where we are legally compelled to. Nothing else. There is no advertising network, no data broker, and no third-party tracker on this site.",
        "Typefaces are served from our own domain rather than fetched from Google as you browse, so visiting this site does not announce you to a font provider.",
      ],
    },
    {
      id: "cookies",
      heading: "6. Cookies and browser storage",
      blocks: [
        "This site has no advertising cookies, no tracking pixels and no cookie banner, because it sets nothing that would need your consent.",
        {
          list: [
            "**Session cookies** — set only once you sign in, to keep you signed in. Strictly necessary; the portal cannot work without them. Cleared when you sign out.",
            "**A language preference** — the letters `en` or `bg`, kept in your own browser so the site opens in the language you chose. It never leaves your device.",
            "**Visit counting** — we use Vercel Analytics, which counts page views without cookies and without building a profile of you. It tells us that a page was viewed, not who viewed it.",
          ],
        },
      ],
    },
    {
      id: "where",
      heading: "7. Where your data is kept",
      blocks: [
        "The database, your account and every photograph are stored in Frankfurt, Germany — inside the European Union.",
        "Our hosting provider, Vercel Inc., is established in the United States and serves the public pages of the site from a worldwide network. Where that involves a transfer outside the EU, it is covered by the safeguards Article 46 of the GDPR requires — standard contractual clauses and the provider's certification under the EU–US Data Privacy Framework. The private portal data described in section 2 is not part of that network: it stays in the database in Frankfurt.",
      ],
    },
    {
      id: "retention",
      heading: "8. How long we keep it",
      blocks: [
        {
          list: [
            "**Your account and everything in it** — for as long as you have an account with us. Ask us to close it and it goes.",
            "**Accounting records** — for the periods Bulgarian accounting law sets, which is currently five years for primary accounting documents and ten years for accounting registers and financial statements. These periods override a deletion request, because we are not permitted to destroy them earlier. What survives is the record of a transaction, not your measurements.",
            "**Server logs** — a short rolling window held by our host, then overwritten.",
          ],
        },
        "One thing worth saying plainly: because our database plan includes no automatic backups, the studio periodically downloads a copy of the records to a computer in the studio. That copy holds the same account, order and measurement data (it does not include photographs). When you ask us to delete your data we remove it from those copies too.",
      ],
    },
    {
      id: "security",
      heading: "9. How it is protected",
      blocks: [
        {
          list: [
            "Everything travels over an encrypted connection (HTTPS), and is encrypted where it is stored.",
            "The database enforces, row by row, that a client can read and change only their own records. That rule lives in the database itself, so it holds even if a mistake is made in the website's code.",
            "Prices, order stages and order status can be changed only by the studio — the database refuses the change otherwise.",
            "Photographs sit in private storage, filed under the owner's account, reachable only through links that expire.",
            "The keys that could bypass these rules exist only on the server and are never sent to a browser.",
          ],
        },
        "No system is perfect. If a breach ever occurs that puts your rights at risk, we will notify the Commission for Personal Data Protection within 72 hours and tell you directly where the law requires it.",
      ],
    },
    {
      id: "rights",
      heading: "10. Your rights",
      blocks: [
        "The GDPR gives you the following, and we will not ask you why you are exercising any of them:",
        {
          list: [
            "**Access** — a copy of what we hold about you.",
            "**Rectification** — a correction, if something is wrong. Most of it you can simply edit yourself in the portal.",
            "**Erasure** — deletion of your account and its contents. Deleting an account removes the login, the profile, the measurements, the delivery details, the orders, the notes, the messages, the wardrobe and the photographs. It is immediate and it cannot be undone.",
            "**Restriction** — a pause on our using it, while something is disputed.",
            "**Portability** — your data in a machine-readable file, to take elsewhere.",
            "**Objection** — to any use we base on legitimate interests.",
            "**Withdrawal of consent** — for photographs, at any time, from the toggle itself or by writing to us.",
          ],
        },
        `Write to ${CONTROLLER.email}. We answer within one month, and we will tell you if a request needs longer or if the law prevents us from doing part of it.`,
      ],
    },
    {
      id: "complaints",
      heading: "11. If you are unhappy with how we handled it",
      blocks: [
        "Tell us first — most things are a misunderstanding we can fix the same day. If that does not satisfy you, you have the right to complain to the Bulgarian supervisory authority:",
        {
          list: [
            "Commission for Personal Data Protection (Комисия за защита на личните данни)",
            "2 Prof. Tsvetan Lazarov Blvd., Sofia 1592, Bulgaria",
            "kzld.bg",
          ],
        },
        "You may also complain to the supervisory authority of the EU country where you live.",
      ],
    },
    {
      id: "children",
      heading: "12. Children",
      blocks: [
        "Portal accounts are for adults. We do not knowingly create an account for a child. Where a garment is made for a minor, the account and the consents belong to the parent or guardian, who provides the measurements. If you believe a child has registered here, write to us and we will remove the account.",
      ],
    },
    {
      id: "changes",
      heading: "13. Changes to this policy",
      blocks: [
        "If what we do with your data changes, this page changes with it and the date at the top moves. If a change is significant — a new recipient, a new purpose — we will tell account holders directly rather than expect you to notice.",
      ],
    },
  ],
};

const bg: Policy = {
  eyebrow: "Правна информация",
  title: "Политика за поверителност",
  updatedLabel: `Последна редакция: ${PRIVACY_UPDATED.bg}`,
  intro:
    "Tidote Atelier шие дрехи по вашите мерки. Това означава да знаем тялото ви, адреса ви и какво сте поръчали — ателие по мярка не може да се преструва на друго. Тази страница казва точно какво пазим, защо, кой друг го вижда и как да поискате да го изтрием.",
  sections: [
    {
      id: "controller",
      heading: "1. Кой отговаря за вашите данни",
      blocks: [
        `Администратор на вашите лични данни е ${CONTROLLER.legalName.bg} (ЕИК ${CONTROLLER.companyNumber}), с търговско име Tidote Atelier, ${CONTROLLER.address.bg}.`,
        `За всичко в тази политика — въпрос, поправка, искане за изтриване — пишете на ${CONTROLLER.email}. Там чете човек, не система за заявки.`,
        "Ние сме малко ателие и не сме длъжни да назначаваме длъжностно лице по защита на данните. Искането ви стига директно до студиото.",
      ],
    },
    {
      id: "collect",
      heading: "2. Какво събираме",
      blocks: [
        "Зависи изцяло от това дали само разглеждате сайта, или сте клиент с профил в портала.",
        "**Ако само разглеждате.** Не ви питаме за нищо и без профил няма къде да въведете нищо. Хостингът ни записва обичайните технически данни за всяка заявка — IP адрес, браузър, поисканата страница, часът — така работи всеки уеб сървър и така се забелязват атаки. Броим и посещенията обобщено (вижте раздел 6). Нищо от това не ви идентифицира пред нас по име.",
        "**Ако имате профил в портала,** пазим това, което е нужно на ателието, за да скрои и достави дрехата:",
        {
          list: [
            "Профил: име, имейл адрес, телефон и датата на създаване.",
            "Мерки: височина, рамене, гръдна обиколка, талия и долна талия, горна част на ръката, бицепс, китка, вътрешен шев, бедро, глезен и бележки от пробите.",
            "Доставка: адрес, град, пощенски код, телефон и указания за доставка.",
            "Поръчки: изделието, категорията, цената, датите, етапът, на който е стигнало, дали е върнато и бележките на ателието по него.",
            "Снимки: референтни изображения към поръчка, снимки на ваши дрехи, които качвате, и снимки, които правите на завършено изделие.",
            "Съобщения: това, което вие и ателието си пишете в портала.",
            "Проби: датата и часът, за които сте се записали.",
          ],
        },
        "Не събираме специални категории данни — няма здравни данни, няма биометрични идентификатори. Мерките, взети за шиене, не са здравни данни. Никога не искаме и не съхраняваме данни за банкови карти; плащането се урежда извън този сайт.",
        "Профилът ви съществува по един от два начина: регистрирали сте се сами или студиото го е създало, след като ви е взело мерки на място, и ви е дало паролата. И в двата случая профилът е ваш, съдържа същото и може да бъде изтрит при поискване.",
      ],
    },
    {
      id: "why",
      heading: "3. Защо го използваме и на какво правно основание",
      blocks: [
        "Съгласно GDPR сме длъжни да посочим правно основание за всяка употреба. Нашите са:",
        {
          list: [
            "**За да изработим и доставим поръчаното** — мерки, адрес, история на поръчките и съобщения. Основание: изпълнение на договор с вас (чл. 6, § 1, б. „б“). Без тях няма дреха; тези данни не са по избор.",
            "**За да работи профилът ви** — вход, преглед на поръчките, записване за проба. Основание: изпълнение на договор (чл. 6, § 1, б. „б“).",
            "**За да показваме работата си публично** — снимки на завършено изделие, в сайта, в социалните мрежи или в лукбук. Основание: вашето съгласие (чл. 6, § 1, б. „а“), давано за всяка поръчка и оттегляемо. Вижте раздел 4.",
            "**За да водим редовно счетоводство** — какво е продадено, за колко и кога. Основание: законово задължение по българското счетоводно и данъчно законодателство (чл. 6, § 1, б. „в“).",
            "**За да работи сайтът и да е сигурен** — сървърни логове и обобщено броене на посещения. Основание: нашият легитимен интерес сайтът да е достъпен и да не бъде злоупотребяван (чл. 6, § 1, б. „е“).",
          ],
        },
        "Не ви профилираме, не вземаме автоматизирани решения за вас и никога не продаваме, отдаваме или разменяме вашите данни с когото и да било.",
      ],
    },
    {
      id: "photos",
      heading: "4. Снимки и превключвателят за реклама",
      blocks: [
        "Всяка снимка в портала е лична по подразбиране. Тя се пази в хранилище, което не е публично четимо, и се отваря само чрез временна подписана връзка, издадена на вас или на студиото.",
        "Когато качите снимки на завършено изделие, до тях стои отделен превключвател: *Tidote Atelier може да използва тези снимки, за да показва работата си — сайт, социални мрежи и лукбукове.* Той е изключен, докато вие не го включите, пита се за всяка поръчка поотделно, а не веднъж за всичко, и датата на включване се записва, за да можем да ви покажем с какво сте се съгласили.",
        "Може да го изключите по всяко време, от същото място, без да обяснявате защо. Изключването спира всяка бъдеща употреба веднага. То не може да разпечата обратно вече отпечатан лукбук, нито да стигне до чужда републикация, затова ще свалим и това, което още контролираме — кажете ни и ще го направим.",
        "Оттеглянето на това съгласие не се отразява на нищо друго: поръчката, профилът и отношението ви с ателието остават непроменени.",
        "Единственото изключение е публичната витрина на страницата „В наличност“, която показва снимки на дрехи — не на хора и никога свързани с име на клиент. Продадените изделия изчезват изцяло от нея.",
      ],
    },
    {
      id: "recipients",
      heading: "5. Кой друг ги вижда",
      blocks: [
        "Само студиото и фирмите, които поддържат машините, върху които стои този сайт. Всяка от тях действа по наши указания като обработващ, по договор за обработване на данни:",
        {
          list: [
            "**Supabase** — базата данни, системата за вход и хранилището за снимки. Хоствани във Франкфурт, Германия.",
            "**Vercel** — хостингът и доставката на самия сайт, както и обобщеният брояч на посещения.",
            "**Hostinger** — нашата поща, включително съобщенията, които системата ви изпраща за профила ви.",
          ],
        },
        "Извън тях разкриваме лични данни само на счетоводителя ни за документите, които законът изисква да пазим, и на държавен орган, когато сме правно задължени. Нищо друго. На този сайт няма рекламна мрежа, няма търговец на данни и няма проследяващи скриптове на трети страни.",
        "Шрифтовете се доставят от нашия собствен домейн, а не се теглят от Google, докато разглеждате — така посещението ви не ви обявява пред доставчик на шрифтове.",
      ],
    },
    {
      id: "cookies",
      heading: "6. Бисквитки и съхранение в браузъра",
      blocks: [
        "Този сайт няма рекламни бисквитки, няма проследяващи пиксели и няма банер за бисквитки, защото не поставя нищо, за което да е нужно вашето съгласие.",
        {
          list: [
            "**Сесийни бисквитки** — поставят се едва след като влезете, за да останете влезли. Строго необходими; порталът не работи без тях. Изчистват се при излизане.",
            "**Езикова настройка** — буквите `en` или `bg`, запазени във вашия браузър, за да се отваря сайтът на избрания от вас език. Никога не напуска устройството ви.",
            "**Броене на посещения** — използваме Vercel Analytics, който брои прегледите на страници без бисквитки и без да изгражда ваш профил. Той ни казва, че една страница е била видяна, не кой я е видял.",
          ],
        },
      ],
    },
    {
      id: "where",
      heading: "7. Къде се съхраняват данните",
      blocks: [
        "Базата данни, профилът ви и всяка снимка се съхраняват във Франкфурт, Германия — в рамките на Европейския съюз.",
        "Хостинг доставчикът ни, Vercel Inc., е установен в САЩ и доставя публичните страници на сайта през световна мрежа. Доколкото това включва предаване извън ЕС, то е покрито от гаранциите по чл. 46 от GDPR — стандартни договорни клаузи и сертификацията на доставчика по Рамката ЕС–САЩ за защита на данните. Личните данни от портала по раздел 2 не са част от тази мрежа: те остават в базата данни във Франкфурт.",
      ],
    },
    {
      id: "retention",
      heading: "8. Колко дълго ги пазим",
      blocks: [
        {
          list: [
            "**Профилът ви и всичко в него** — докато имате профил при нас. Поискайте закриване и той изчезва.",
            "**Счетоводни документи** — за сроковете по българското счетоводно законодателство, които понастоящем са пет години за първичните счетоводни документи и десет години за счетоводните регистри и финансовите отчети. Тези срокове имат предимство пред искане за изтриване, защото нямаме право да ги унищожим по-рано. Оцелява документът за сделката, не вашите мерки.",
            "**Сървърни логове** — кратък подвижен период при хостинга ни, след което се презаписват.",
          ],
        },
        "Едно нещо си струва да се каже направо: понеже планът ни за база данни не включва автоматични резервни копия, студиото периодично сваля копие на записите на компютър в ателието. Това копие съдържа същите данни за профила, поръчките и мерките (не включва снимки). Когато поискате изтриване, премахваме данните и от тези копия.",
      ],
    },
    {
      id: "security",
      heading: "9. Как са защитени",
      blocks: [
        {
          list: [
            "Всичко пътува по криптирана връзка (HTTPS) и е криптирано там, където се съхранява.",
            "Базата данни налага, ред по ред, че клиент може да чете и променя само своите записи. Това правило живее в самата база данни, така че важи дори при грешка в кода на сайта.",
            "Цени, етапи и статус на поръчка може да променя само студиото — иначе базата данни отказва промяната.",
            "Снимките стоят в лично хранилище, подредени под профила на притежателя си, достъпни само през връзки с изтичащ срок.",
            "Ключовете, които биха могли да заобиколят тези правила, съществуват само на сървъра и никога не се изпращат към браузър.",
          ],
        },
        "Нито една система не е съвършена. Ако някога възникне нарушение, което застрашава правата ви, ще уведомим Комисията за защита на личните данни в срок от 72 часа и ще уведомим и вас пряко, когато законът го изисква.",
      ],
    },
    {
      id: "rights",
      heading: "10. Вашите права",
      blocks: [
        "GDPR ви дава изброените по-долу права и няма да ви питаме защо упражнявате което и да е от тях:",
        {
          list: [
            "**Достъп** — копие от това, което пазим за вас.",
            "**Коригиране** — поправка, ако нещо е сгрешено. По-голямата част може да редактирате сами в портала.",
            "**Изтриване** — заличаване на профила ви и съдържанието му. Изтриването на профил премахва входа, профила, мерките, данните за доставка, поръчките, бележките, съобщенията, гардероба и снимките. То е незабавно и необратимо.",
            "**Ограничаване** — спиране на употребата, докато нещо се изяснява.",
            "**Преносимост** — вашите данни в машинночетим файл, за да ги отнесете другаде.",
            "**Възражение** — срещу всяка употреба, която основаваме на легитимен интерес.",
            "**Оттегляне на съгласие** — за снимките, по всяко време, от самия превключвател или с писмо до нас.",
          ],
        },
        `Пишете на ${CONTROLLER.email}. Отговаряме в рамките на един месец и ще ви кажем, ако искането изисква повече време или ако законът ни пречи да изпълним част от него.`,
      ],
    },
    {
      id: "complaints",
      heading: "11. Ако не сте доволни от начина, по който сме постъпили",
      blocks: [
        "Кажете първо на нас — повечето неща са недоразумение, което можем да оправим същия ден. Ако това не ви удовлетвори, имате право на жалба до българския надзорен орган:",
        {
          list: [
            "Комисия за защита на личните данни",
            "гр. София 1592, бул. „Проф. Цветан Лазаров“ № 2",
            "kzld.bg",
          ],
        },
        "Може да подадете жалба и до надзорния орган на държавата от ЕС, в която живеете.",
      ],
    },
    {
      id: "children",
      heading: "12. Деца",
      blocks: [
        "Профилите в портала са за пълнолетни. Не създаваме съзнателно профил на дете. Когато дреха се шие за непълнолетен, профилът и съгласията принадлежат на родителя или настойника, който предоставя мерките. Ако смятате, че дете се е регистрирало тук, пишете ни и ще премахнем профила.",
      ],
    },
    {
      id: "changes",
      heading: "13. Промени в тази политика",
      blocks: [
        "Ако това, което правим с данните ви, се промени, тази страница се променя с него и датата най-горе се мести. При съществена промяна — нов получател, нова цел — ще уведомим притежателите на профили пряко, вместо да очакваме да забележите.",
      ],
    },
  ],
};

export const PRIVACY: Record<Lang, Policy> = { en, bg };
