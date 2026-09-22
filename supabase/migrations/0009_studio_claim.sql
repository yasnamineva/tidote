-- Becoming the studio without waiting for an email.
--
-- 0007 made the allow-list grant studio access, but only once the address had
-- been confirmed: listing an address said who *may* become the studio, and
-- reading the mail sent to it was what actually did it. That closed the hole
-- 0005 opened — anyone registering support@tidoteatelier.com walking straight
-- into the panel — and it works, as long as the mail arrives.
--
-- It does not arrive. Supabase's built-in mailer sends only to members of the
-- project's own organisation, two messages an hour, and custom SMTP is not
-- configured yet: registering returns `over_email_send_rate_limit` and the
-- promotion never comes. The owner of the atelier cannot get into her own
-- panel.
--
-- So the second factor stops being "can you read that mailbox" and becomes
-- "do you know the code" — a code she sets here, once, and types on the
-- website when she chooses her password. The allow-list still decides *who*
-- may be the studio; the code proves it is her. No mail is involved: the
-- account is created already-confirmed, which is a state `handle_new_user`
-- already treats as studio for a listed address (0007), so the role logic is
-- untouched.
--
-- What this is not: a password. It is used once, it is stored hashed, the row
-- is marked claimed, and a claimed row cannot be claimed again.

alter table admin_emails
  add column if not exists setup_code_hash text,
  add column if not exists claimed_at timestamptz;

-- sha256 is built into Postgres 11+, so this needs no extension. The address
-- is mixed in as the salt: two rows that happen to share a code do not share a
-- hash, and a hash lifted from here cannot be replayed against another row.
create or replace function studio_code_hash(p_email text, p_code text)
returns text language sql immutable as $$
  select encode(
    sha256(convert_to('tidote-studio-claim|' || lower(p_email) || '|' || p_code, 'utf8')),
    'hex'
  );
$$;

/*
  Setting the code. Run this in the SQL editor, once, for the address you will
  sign in with:

      select set_studio_code('marinova.tedi@gmail.com', 'a code only you know');

  Then go to /studio-setup on the website and enter the address, that code, and
  the password you want. Ten characters minimum, and it is worth more than ten.
  Nothing about the code is stored — only its hash — so if it is forgotten, set
  a new one with the same call.
*/
create or replace function set_studio_code(p_email text, p_code text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if length(coalesce(p_code, '')) < 10 then
    raise exception 'The setup code must be at least 10 characters.';
  end if;
  if not exists (select 1 from admin_emails where email = lower(p_email)) then
    raise exception
      'Add % to admin_emails first — the allow-list is what says this address may be the studio.',
      lower(p_email);
  end if;
  update admin_emails
     set setup_code_hash = studio_code_hash(p_email, p_code),
         -- Setting a new code re-opens the row: this is also how a studio
         -- account gets set up again if the password is lost and there is no
         -- mail to reset it with.
         claimed_at = null
   where email = lower(p_email);
end;
$$;

-- What the claim endpoint asks. Every "no" looks the same from outside: it
-- answers false for an address that is not listed, one with no code set, one
-- already claimed, and a wrong code alike, so the endpoint cannot be used to
-- find out which addresses are on the list.
create or replace function verify_studio_code(p_email text, p_code text)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from admin_emails
     where email = lower(p_email)
       and claimed_at is null
       and setup_code_hash is not null
       and setup_code_hash = studio_code_hash(p_email, p_code)
  );
$$;

create or replace function mark_studio_claimed(p_email text)
returns void language sql security definer set search_path = public as $$
  update admin_emails set claimed_at = now() where email = lower(p_email);
$$;

-- Only the server may call these.
--
-- `from public`, not `from anon, authenticated`. Postgres grants EXECUTE on a
-- new function to PUBLIC, and those two roles inherit it from there — so
-- revoking it from them by name takes away a grant they never had and changes
-- nothing. The access-rule tests caught it: a signed-in client could call
-- set_studio_code() on an allow-listed address, pick their own code, and claim
-- the studio account with it. These are SECURITY DEFINER functions over the
-- allow-list; PUBLIC must not be able to reach any of them.
revoke all on function studio_code_hash(text, text) from public;
revoke all on function set_studio_code(text, text) from public;
revoke all on function verify_studio_code(text, text) from public;
revoke all on function mark_studio_claimed(text) from public;

-- The claim endpoint is the only caller, and it holds the service key. `postgres`
-- keeps access as the owner, which is what the SQL editor runs as.
grant execute on function set_studio_code(text, text) to service_role;
grant execute on function verify_studio_code(text, text) to service_role;
grant execute on function mark_studio_claimed(text) to service_role;

comment on table admin_emails is
  'Addresses that may be the studio. Set a one-time code on a row with '
  'set_studio_code(), then claim it at /studio-setup by entering the address, '
  'the code, and a password. Listing an address grants nothing on its own.';

comment on column admin_emails.claimed_at is
  'When the studio account for this address was created. A claimed row cannot '
  'be claimed again; set_studio_code() clears it.';
