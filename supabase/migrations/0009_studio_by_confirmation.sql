-- The studio registers like anyone else.
--
-- This is the behaviour 0007 installed, restated here so that it holds whether
-- or not 0007 was ever run against this database — every statement is written
-- to be safe to run twice.
--
-- The rule, in full:
--
--   register an address on admin_emails  ->  a client account, unconfirmed
--   confirm that address                 ->  it becomes the studio
--   register anything else               ->  a client, confirmed or not
--
-- Nobody else can take the address, because the promotion is not triggered by
-- typing it into the form — it is triggered by the confirmation link, which
-- arrives in the mailbox. An impostor who registers support@tidoteatelier.com
-- first gets a client account and a promotion that never comes.
--
-- What this replaces: a /studio-setup page and an endpoint that made the
-- account with the service key, built on the belief that the confirmation mail
-- could not be delivered. It can. The `over_email_send_rate_limit` that
-- suggested otherwise came from a test suite registering over and over, two an
-- hour being the limit; the studio's own address receives the mail, and she has
-- clicked one of these links. What actually broke was the Site URL in the
-- Supabase dashboard, still pointing at localhost, which sent the link's
-- redirect to a development machine. That is a setting, not a schema.

-- Signing up. Confirmed-at-creation happens two ways: "auto confirm" in the
-- dashboard, and the studio's own New Client route, which passes
-- email_confirm because it has just met the person.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, role, name, email)
  values (
    new.id,
    case
      when new.email_confirmed_at is not null
       and exists (select 1 from admin_emails where email = new.email)
      then 'admin'::user_role
      else 'client'::user_role
    end,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, '')
  );

  insert into measurements (profile_id) values (new.id);
  insert into delivery_info (profile_id) values (new.id);

  return new;
end;
$$;

-- The ordinary path: register, read the mail, click the link. Supabase stamps
-- email_confirmed_at, and that stamp is the promotion.
--
-- The column guard from 0006 refuses a role change unless `auth.uid()` is null
-- — its way of saying "a decision already made on the server" — and this is one
-- of those: /auth/v1/verify is unauthenticated, so GoTrue writes the
-- confirmation with no user claim and the guard stands aside.
--
-- A first attempt gave the guard an explicit exemption instead, a
-- transaction-local setting this function switched on. The access-rule tests
-- promoted a client with it inside a minute: `set_config` is available to
-- anyone who can run a statement, so the exemption was a bypass with a
-- friendlier name. The guard is left exactly as 0006 wrote it.
create or replace function promote_on_confirm() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from admin_emails where email = new.email) then
    update profiles set role = 'admin'::user_role where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after update on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function promote_on_confirm();

-- The other order.
--
-- Promotion happens on the *transition* to confirmed, so allow-listing an
-- address that is already confirmed used to do nothing at all: the trigger had
-- run days earlier and found no row. That is a trap the studio walked into
-- within the hour — registered with an address, confirmed it, and stayed a
-- client because the address on the list was a different one of hers.
--
-- The list is supposed to be what decides. So adding a row promotes whoever
-- already holds that address, if they have confirmed it, and either order now
-- ends in the same place.
create or replace function promote_on_allow_list() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update profiles p
     set role = 'admin'::user_role
   where p.email = lower(new.email)
     and p.role <> 'admin'::user_role
     and exists (
       select 1 from auth.users u
        where u.id = p.id and u.email_confirmed_at is not null
     );
  return new;
end;
$$;

drop trigger if exists on_admin_email_added on admin_emails;
create trigger on_admin_email_added
  after insert on admin_emails
  for each row execute function promote_on_allow_list();

-- Nothing reaches this from a browser: `admin_emails` has no policy at all, so
-- only the service key and the SQL editor can insert into it — which is where
-- the decision belongs.

-- Left over from the claim page, which is gone.
alter table admin_emails drop column if exists claimed_at;
drop function if exists studio_claim_allowed(text);
drop function if exists mark_studio_claimed(text);
drop function if exists verify_studio_code(text, text);
drop function if exists studio_code_required(text);
drop function if exists set_studio_code(text, text);
drop function if exists studio_code_hash(text, text);

comment on table admin_emails is
  'Addresses that become the studio when their owner registers on the website '
  'and confirms the address. Listing one grants nothing until then: the link '
  'goes to the mailbox, not to whoever typed the address into the form.';
