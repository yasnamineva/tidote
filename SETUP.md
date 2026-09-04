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

In the dashboard, open **SQL Editor** and run these four files in order, from
the `supabase/migrations/` folder in this repo:

| File | What it does |
| --- | --- |
| `0001_init.sql` | Every table, and the `public_stock` view the In Stock page reads |
| `0002_rls.sql` | Who can read and write what |
| `0003_storage.sql` | The two photo buckets and their rules |
| `0004_admin_email.sql` | Which email address is the studio |

**Before running `0004`,** change the address in it to the one you will sign in
with. That row is what makes your account the studio rather than a client. You
can also add the row later — the account just has to be created *after* it
exists.

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
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_…
SUPABASE_SERVICE_ROLE_KEY=sb_secret_…
CRON_SECRET=…
NEXT_PUBLIC_DEMO_EMAIL=demo@tidoteatelier.com
NEXT_PUBLIC_DEMO_PASSWORD=…
```

The **publishable/anon** key is meant to be public — on its own it can read
nothing, because every table checks who is asking. The **secret/service_role**
key bypasses all of that, so it stays out of the browser: it has no
`NEXT_PUBLIC_` prefix, which is what stops Next bundling it.

### Then into Vercel

All six lines go in **Vercel → your project → Settings → Environment
Variables**, for Production. Vercel does not read `.env.local` — that file is
local only, and is excluded from deploys.

## 4. Create your own login

There is no sign-up form on the site — clients are added by you, not by
themselves — so the first account is made from the command line:

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

## 5. Seed the demo account

```
npm run seed
```

This creates the demo client, four invented orders, a wardrobe and a starting
rail. Everything it makes is fictional, which is why its password can be printed
on the public login page. Delete `NEXT_PUBLIC_DEMO_EMAIL` and
`NEXT_PUBLIC_DEMO_PASSWORD` and the demo button disappears.

## 6. Backups — please read this one

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

`npm run test:db` applies all four migrations to a throwaway database and checks
that the access rules *behave* — that a client cannot read another client's
records, cannot price their own order, and that a stranger reaching for the rail
gets the view rather than the table.

`npm run test:wiring` puts PostgREST in front of it and runs the app's own
queries through it. The select strings are read out of `src/` rather than
retyped, so it proves the ones actually shipped.

## What to watch as it grows

The limit you would hit first is **5 GB of egress a month** — every photo a
visitor loads counts. That is generous for a portal used by you and your
clients. If the public In Stock page ever gets real traffic, that is the moment
to upgrade; no code changes when you do.
