-- Someone asking about a garment without having an account.
--
-- Until now the only way to ask was the Instagram link on a rail card, which
-- leaves the studio reading DMs and nothing on the site knowing it happened.
-- An enquiry is not a client and not an order: it is a stranger's question,
-- and it needs to survive long enough to be answered.
--
-- Nobody but the studio may read these. They hold an email address and a
-- phone number belonging to a person who has not signed up for anything, so
-- there is deliberately no policy here for `anon` or `authenticated` at all --
-- not even insert. They arrive through /api/enquiries, which is the only place
-- that can also raise the notification and send the mail.

create table enquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default '',
  email       text not null default '',
  phone       text not null default '',
  message     text not null default '',
  -- What they were looking at, if they were looking at something. Kept by name
  -- as well, because the piece may be sold and gone by the time she reads it.
  piece_id    uuid references ready_pieces on delete set null,
  piece_name  text not null default '',
  -- Which language they wrote in, so she knows which to answer in.
  lang        text not null default 'bg',
  handled     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index enquiries_open_idx on enquiries (handled, created_at desc);

alter table enquiries enable row level security;

create policy "studio handles enquiries" on enquiries
  for all using (is_admin()) with check (is_admin());
