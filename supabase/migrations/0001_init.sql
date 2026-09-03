-- Tidote Atelier — initial schema.
--
-- Replaces the browser-localStorage prototype. Three rules run through it:
--
--   1. A client sees their own records and nothing else. That is enforced here
--      in row-level security, not in the React code, because the React code
--      runs on the client's machine and is not a security boundary.
--   2. The studio sees everything, by being the one profile with role 'admin'.
--   3. The public In Stock page reads a *view* that exposes only the columns a
--      stranger may see. The ready_pieces table itself is admin-only, so the
--      buyer's name and the studio's private notes never leave the server.

-- ---------------------------------------------------------------- enums

create type user_role       as enum ('client', 'admin');
create type order_status    as enum ('received', 'in_production', 'ready', 'shipped', 'delivered');
create type review_status   as enum ('pending', 'accepted', 'denied');
create type ready_status    as enum ('available', 'reserved', 'sold');
create type note_author     as enum ('client', 'studio');
create type notif_audience  as enum ('client', 'admin');
create type doc_status      as enum ('todo', 'in_progress', 'done', 'na');
create type doc_recurrence  as enum ('once', 'monthly', 'annual');
create type doc_group       as enum ('setup', 'tax', 'social', 'consumer', 'product', 'data');

-- ---------------------------------------------------------------- identity

-- Who gets to be studio staff. Seeded with the owner's address; the signup
-- trigger reads it, so she becomes an admin by signing up normally rather than
-- by someone hand-editing a row afterwards.
create table admin_emails (
  email text primary key
);

create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  role        user_role not null default 'client',
  name        text not null default '',
  email       text not null default '',
  phone       text not null default '',
  -- A throwaway account kept deliberately, so the portal can be shown to
  -- someone without handing them a real client's measurements.
  is_demo     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Reading a role from inside a policy on `profiles` would recurse, so this
-- runs as definer and bypasses RLS for that one lookup.
create function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, role, name, email)
  values (
    new.id,
    case when exists (select 1 from admin_emails where email = new.email)
      then 'admin'::user_role else 'client'::user_role end,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------- client data

create table measurements (
  profile_id    uuid primary key references profiles on delete cascade,
  height        text not null default '',
  shoulders     text not null default '',
  chest         text not null default '',
  waist_natural text not null default '',
  lower_waist   text not null default '',
  upper_arm     text not null default '',
  biceps        text not null default '',
  wrist         text not null default '',
  inseam        text not null default '',
  thigh         text not null default '',
  ankle         text not null default '',
  notes         text not null default '',
  updated_at    timestamptz
);

create table delivery_info (
  profile_id  uuid primary key references profiles on delete cascade,
  address     text not null default '',
  city        text not null default '',
  postal_code text not null default '',
  phone       text not null default '',
  notes       text not null default '',
  updated_at  timestamptz
);

-- Human-readable and shown to the client ("TD-1042"), so it stays the key
-- rather than hiding behind a uuid nobody can read out over the phone.
create sequence order_code_seq start 1100;
create function next_order_code() returns text
language sql volatile as $$
  select 'TD-' || lpad(nextval('order_code_seq')::text, 4, '0');
$$;

create table orders (
  id               text primary key default next_order_code(),
  profile_id       uuid not null references profiles on delete cascade,
  piece            text not null default '',
  category         text not null default 'Accessory',
  photos           text[] not null default '{}',
  placed_on        date not null default current_date,
  status           order_status not null default 'received',
  review_status    review_status not null default 'pending',
  eta              text not null default '',
  total            text not null default '',
  notes            text not null default '',
  -- The client's own photos of the finished piece, and the single permission
  -- that governs them. Off unless they said yes; dated when they did.
  wear_photos      text[] not null default '{}',
  photo_consent    boolean not null default false,
  photo_consent_on date,
  returned_on      date,
  created_at       timestamptz not null default now()
);
create index orders_profile_idx on orders (profile_id);

create table order_notes (
  id         uuid primary key default gen_random_uuid(),
  order_id   text not null references orders on delete cascade,
  author     note_author not null,
  text       text not null default '',
  photos     text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index order_notes_order_idx on order_notes (order_id, created_at);

create table wardrobe_items (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles on delete cascade,
  name       text not null default '',
  category   text not null default 'Accessory',
  photos     text[] not null default '{}',
  notes      text not null default '',
  added_on   date not null default current_date
);
create index wardrobe_profile_idx on wardrobe_items (profile_id);

create table messages (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles on delete cascade,
  sender     note_author not null,
  text       text not null default '',
  created_at timestamptz not null default now()
);
create index messages_profile_idx on messages (profile_id, created_at);

create table notifications (
  id         uuid primary key default gen_random_uuid(),
  audience   notif_audience not null,
  profile_id uuid references profiles on delete cascade,
  kind       text not null,
  text       text not null default '',
  href       text not null default '',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_inbox_idx on notifications (audience, profile_id, created_at desc);

-- ---------------------------------------------------------------- the rail

create table ready_pieces (
  id            uuid primary key default gen_random_uuid(),
  name          text not null default '',
  category      text not null default 'Accessory',
  size          text not null default '',
  price         numeric(10, 2) not null default 0,
  status        ready_status not null default 'available',
  photos        text[] not null default '{}',
  -- Studio-only, all three: who it is held for, what she thinks of it, and
  -- which order it came back from.
  notes         text not null default '',
  held_for      text not null default '',
  from_order_id text references orders on delete set null,
  added_on      date not null default current_date,
  sold_on       date
);

-- What a stranger on /in-stock is allowed to know. Sold pieces are gone
-- entirely; held_for, notes and from_order_id are not in the view at all, so no
-- API call can reach them.
create view public_stock
with (security_invoker = false) as
  select id, name, category, size, price, status, photos, added_on
  from ready_pieces
  where status <> 'sold';

-- ---------------------------------------------------------------- studio only

create table studio_settings (
  id            boolean primary key default true check (id),
  weekly_hours  jsonb not null default '{}'::jsonb
);
insert into studio_settings (id) values (true);

create table availability (
  date  date primary key,
  open  boolean not null default true,
  slots jsonb not null default '[]'::jsonb
);

create table bookings (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  time        text not null,
  profile_id  uuid not null references profiles on delete cascade,
  order_id    text references orders on delete set null,
  created_at  timestamptz not null default now(),
  unique (date, time)
);
create index bookings_profile_idx on bookings (profile_id);

create table expenses (
  id           uuid primary key default gen_random_uuid(),
  date         date not null,
  category     text not null default 'other',
  vendor       text not null default '',
  description  text not null default '',
  amount       numeric(10, 2) not null default 0,
  has_document boolean not null default false,
  document_no  text not null default '',
  created_at   timestamptz not null default now()
);

create table compliance_items (
  id          uuid primary key default gen_random_uuid(),
  seed_key    text not null default '',
  title       text not null default '',
  description text not null default '',
  "group"     doc_group not null default 'setup',
  recurrence  doc_recurrence not null default 'once',
  status      doc_status not null default 'todo',
  reference   text not null default '',
  due_on      date,
  notes       text not null default ''
);
-- Seed rows are identified by key so a corrected citation can reach everyone,
-- and a deleted one stays deleted.
create unique index compliance_seed_key_idx on compliance_items (seed_key) where seed_key <> '';

-- A row to write to, so the daily keep-alive is real database activity rather
-- than a read that a cache could answer. Free-tier projects pause after seven
-- quiet days; this is what stops the timer reaching zero.
create table heartbeat (
  id       boolean primary key default true check (id),
  beat_at  timestamptz not null default now()
);
insert into heartbeat (id) values (true);
