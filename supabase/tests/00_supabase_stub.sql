-- The parts of Supabase the migrations lean on, reproduced locally so the
-- schema can be executed rather than only parsed. Deliberately minimal: enough
-- to make auth.uid(), the signup trigger and the storage policies resolve.
create extension if not exists pgcrypto;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;

create schema if not exists auth;
create schema if not exists storage;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  -- Null until the address is proved. 0007 makes that stamp the thing that
  -- promotes an allow-listed address, so the tests need to set it.
  email_confirmed_at timestamptz,
  raw_user_meta_data jsonb default '{}'::jsonb
);

-- Supabase reads the subject out of the request's JWT claims. Impersonating a
-- user in these tests therefore means setting that GUC.
-- PostgREST exposes the whole claim set as one JSON GUC; the psql suite sets
-- the single claim directly. Accept either, so the same stub serves both.
create or replace function auth.uid() returns uuid
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::json ->> 'sub',
    nullif(current_setting('request.jwt.claim.sub', true), '')
  )::uuid;
$$;

create or replace function auth.role() returns text
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::json ->> 'role',
    nullif(current_setting('request.jwt.claim.role', true), ''),
    'anon'
  );
$$;

-- PostgREST connects as this role and switches to the one the JWT names.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'authenticator') then
    create role authenticator login noinherit;
  end if;
end $$;
grant anon, authenticated, service_role to authenticator;

create table storage.buckets (
  id text primary key, name text, public boolean default false,
  file_size_limit bigint, allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets, name text, owner uuid
);
alter table storage.objects enable row level security;

create or replace function storage.foldername(name text) returns text[]
language sql immutable as $$
  select string_to_array(name, '/');
$$;
