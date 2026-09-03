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

**Before running `0004`,** check that the address in it is the one you will sign
in with. That row is what makes your account the studio rather than a client.

## 3. Fill in the keys

Copy `.env.example` to `.env.local` and fill it in from **Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=…       # "anon public" — safe in the browser
SUPABASE_SERVICE_ROLE_KEY=…           # "service_role" — never in the browser
CRON_SECRET=…                         # any long random string
NEXT_PUBLIC_DEMO_EMAIL=demo@tidoteatelier.com
NEXT_PUBLIC_DEMO_PASSWORD=…           # 12+ characters
```

The **anon key** is meant to be public — on its own it can read nothing, because
every table checks who is asking. The **service role key** bypasses all of that,
so it stays out of the browser: it has no `NEXT_PUBLIC_` prefix, which is what
stops Next from bundling it.

The same five variables go into **Vercel → Settings → Environment Variables**
before the next deploy.

## 4. Create your own login

Run the site (`npm run dev`), go to `/login`, and sign up with the address you
put in `0004_admin_email.sql`. Because that row exists, the account is created
as the studio.

> If you sign in and land on `/dashboard` instead of `/admin`, the address did
> not match. Fix the row and create the account again.

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

## What to watch as it grows

The limit you would hit first is **5 GB of egress a month** — every photo a
visitor loads counts. That is generous for a portal used by you and your
clients. If the public In Stock page ever gets real traffic, that is the moment
to upgrade; no code changes when you do.
