# Setting up the backend

The portal used to keep everything in the browser. It now runs on Supabase —
Postgres for the records, Supabase Auth for logins, and object storage for
photos. This is the one part nobody can do for you, because it starts with an
account in your name.

Roughly fifteen minutes.

---

## 1. Create the project

1. Sign up at [supabase.com](https://supabase.com) and create a project.
2. **Choose the Frankfurt (eu-central-1) region.** Client measurements, names
   and addresses are personal data; keeping them in the EU is the simplest
   answer to where they live.
3. Pick a strong database password and save it in your password manager. You
   will rarely need it, and it cannot be recovered.

The free plan is enough: 500 MB of database against records that are almost all
text, and 1 GB of photo storage against uploads that get downscaled to roughly
200 KB each. What it does **not** include is backups — see step 6.

## 2. Run the migrations

In the dashboard, open **SQL Editor** and run these five files in order, from
the `supabase/migrations/` folder in this repo:

| File | What it does |
| --- | --- |
| `0001_init.sql` | Every table, and the `public_stock` view the In Stock page reads |
| `0002_rls.sql` | Who can read and write what |
| `0003_storage.sql` | The two photo buckets and their rules |
| `0004_admin_email.sql` | Which addresses may be promoted to studio |
| `0005_signup.sql` | What happens when someone registers |

**Before running `0004`,** check the addresses listed in it. That list is who
`npm run create-admin` is *allowed* to promote — being on it grants nothing by
itself, so an unwanted entry is not an open door, but it is worth pruning. You
can add to it later at any time.

## 3. Fill in the keys

Three of these come from **Supabase**; you invent the rest. Then the whole set
goes into **Vercel** as well. Two dashboards, so it is worth being exact about
which one each thing lives in.

### From the Supabase dashboard

Open your project, then **Settings → API Keys** in the left sidebar. (There is
also a **Connect** button in the top bar that shows the URL and key together for
Next.js, if you prefer.)

| What you need | Where it is | Goes into |
| --- | --- | --- |
| Project URL | Settings → API Keys, at the top | `NEXT_PUBLIC_SUPABASE_URL` |
| Publishable key — starts `sb_publishable_` (older projects call this **anon public**) | Settings → API Keys | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Secret key — starts `sb_secret_` (older projects call this **service_role**) | Settings → API Keys, behind a *Reveal* button | `SUPABASE_SERVICE_ROLE_KEY` |

> Supabase is renaming these. A project created now shows **publishable** and
> **secret**; older ones show **anon** and **service_role**. They go in the same
> two slots either way — our variable names still say anon/service_role, and
> that is fine.

### You make these two up

| Variable | What to put |
| --- | --- |
| `CRON_SECRET` | Any long random string. Guards the keep-alive and export endpoints. |
| `NEXT_PUBLIC_DEMO_PASSWORD` | 12+ characters. It gets printed on the public login page, so treat it as a label rather than a secret — but not something guessable. |

So `.env.local` ends up looking like:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
SUPABASE_SERVICE_ROLE_KEY=sb_secret_…
CRON_SECRET=<a long random string>
NEXT_PUBLIC_DEMO_EMAIL=demo@tidoteatelier.com
NEXT_PUBLIC_DEMO_PASSWORD=…
```

The **publishable/anon** key is meant to be public — on its own it can read
nothing, because every table checks who is asking. The **secret/service_role**
key bypasses all of that, so it stays out of the browser: it has no
`NEXT_PUBLIC_` prefix, which is what stops Next bundling it.

### Then into Vercel

**Vercel → your project → Settings → Environment Variables**, scoped to
Production. It asks you to file each one as **Config** or **Secret**, and it is
strict about it:

| Variable | Type | Why |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Config** | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Config** | |
| `NEXT_PUBLIC_DEMO_EMAIL` | **Config** | |
| `NEXT_PUBLIC_DEMO_PASSWORD` | **Config** | |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | Bypasses every access rule |
| `CRON_SECRET` | **Secret** | Guards the keep-alive and export endpoints |

> **If Vercel says "Remove the public framework prefix to keep this value
> private… If that's safe, change the variable to Config" —** it is safe, and
> the answer is to switch that variable to **Config**.
>
> Vercel is refusing to call something a secret when it cannot keep it one.
> Anything named `NEXT_PUBLIC_` is written into the JavaScript the browser
> downloads; that is what the prefix *means*. Storing it as a Secret would hide
> it from you in the dashboard while it sat in plain sight in the page source.
>
> All four of ours are genuinely fine in the open. The publishable key grants
> nothing on its own — every table checks who is asking, which is what the 21
> access-rule tests are about. The demo password is printed on the login page
> deliberately. The two that must never be public have no prefix, which is
> exactly why Vercel lets you file them as Secret.

Vercel does not read `.env.local`. That file is local only, and excluded from
deploys.

## 4. Create your own login

Clients can register at `/signup`, but that only ever produces a client
account — nothing typed into a form can grant studio access. So the first
studio login is made from the command line:

```
npm run create-admin -- support@tidoteatelier.com 'a-good-password'
```

It refuses if the address is not listed in `admin_emails`, because the account
would otherwise be created as a client and you would have no way into the studio
panel. It also checks afterwards that the role really came out as `admin`.

Then `npm run dev`, go to `/login`, and sign in. You should land on `/admin`.

> You can also do this from the Supabase dashboard under **Authentication →
> Users → Add user** — tick *auto confirm* so the account can sign in without a
> verification email. The command is just less to get wrong.

## 5. Turn on email — clients cannot register without it

**This one is not optional if clients are going to use the site.** Supabase's
built-in email sender delivers **only to members of your Supabase organisation,
at 2 messages an hour**. Everything else is rejected outright. So with it,
a client registering gets no confirmation link and a forgotten password can
never be reset — silently, from their side.

Use your own mailbox instead. In the Supabase dashboard, **Authentication →
Emails → SMTP Settings**, enable custom SMTP and fill in:

| Field | Value |
| --- | --- |
| Host | `smtp.hostinger.com` |
| Port | `465` |
| Username | `support@tidoteatelier.com` |
| Password | that mailbox's password |
| Sender email | `support@tidoteatelier.com` |
| Sender name | Tidote Atelier |

There is no DNS to change for this, and that is worth knowing rather than
assuming: your SPF record already says `include:_spf.mail.hostinger.com`, so
mail sent through Hostinger from your own address is already authorised. **Do
not add anything to the root SPF record** — the Hostinger MX entries and that
one TXT line are what keep your mailboxes working.

While you are on that screen, leave **Confirm email** switched on. It is what
stops someone registering with an address that is not theirs.

## 6. Seed the demo account

```
npm run seed
```

This creates the demo client, four invented orders, a wardrobe and a starting
rail. Everything it makes is fictional, which is why its password can be printed
on the public login page. Delete `NEXT_PUBLIC_DEMO_EMAIL` and
`NEXT_PUBLIC_DEMO_PASSWORD` and the demo button disappears.

## How people get accounts

Two ways in, and they produce the same kind of account:

- **A client registers themselves** at `/signup`. They confirm their address by
  email and can sign in straight away, with an empty measurement sheet.
- **You add them** from the studio panel — *Clients → New Client*. You set the
  password and pass it on; they can change it from the sign-in page whenever
  they like.

Neither can make anyone studio. Signing up always produces a client, whatever
address is used — including one listed in `admin_emails`. Promotion happens only
through `npm run create-admin`, which runs on the server with the secret key.

**To change your own password**, either run `npm run create-admin` again with the
new one, or use *Forgot your password?* on the sign-in page like anyone else.

## 7. Backups — please read this one

**The free plan takes no backups at all.** If the project is deleted or a row is
overwritten, there is nothing to restore from.

Two things follow:

- **Download a backup regularly.** There is a *Download Backup* button at the
  bottom of the studio sidebar. It gives you a JSON file of every record. Once a
  week, and before anything you are unsure about, is a reasonable habit.
- **The free tier pauses after 7 days of no traffic.** A daily cron
  (`vercel.json` → `/api/cron/keepalive`) writes one row at 04:00 UTC to stop
  that. It needs `CRON_SECRET` set in Vercel to run.

Upgrading to **Pro ($25/mo)** adds daily backups kept for seven days and removes
the pausing. Until then, the button is the backup.

## Running the tests

Two suites check the database side without needing a Supabase project at all.
They stub the few Supabase objects the schema leans on and run against a local
Postgres, so they test our SQL rather than Supabase.

```
brew install postgresql@17 postgrest
npm test
```

`npm run test:db` applies every migration to a throwaway database and checks
that the access rules *behave* — that a client cannot read another client's
records, cannot price their own order, and that a stranger reaching for the rail
gets the view rather than the table.

`npm run test:wiring` puts PostgREST in front of it and runs the app's own
queries through it. The select strings are read out of `src/` rather than
retyped, so it proves the ones actually shipped.

`npm run test:layout` is the third suite and needs no database. It builds the
site, opens it in a real browser at ten widths from 320px to 1920px, on every
public page, in both languages, and fails if any two pieces of text paint on
top of each other or anything lands outside the viewport. It exists because the
desktop menu once overlapped the wordmark in production for weeks: the page has
`overflow-x: clip`, so there was no scrollbar and no warning to notice.

## What to watch as it grows

The limit you would hit first is **5 GB of egress a month** — every photo a
visitor loads counts. That is generous for a portal used by you and your
clients. If the public In Stock page ever gets real traffic, that is the moment
to upgrade; no code changes when you do.
