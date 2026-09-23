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
-- configured yet: registering answers `over_email_send_rate_limit` and the
-- promotion never comes. The owner of the atelier cannot get into her own
-- panel.
--
-- So the allow-list becomes the gate on its own, and the password is set on the
-- website:
--
--   on admin_emails, claimed_at is null  ->  this address may claim the studio
--                                            account at /studio-setup
--   claimed_at set                       ->  it may not, and cannot be claimed
--                                            a second time by anyone
--
-- No mail anywhere in it. The account is created already-confirmed, which is a
-- state `handle_new_user` has treated as studio for a listed address since
-- 0007 — so the role still comes from the database and the role logic here is
-- untouched.
--
-- There was a one-time setup code in between, as a second factor. It is gone:
-- the reset mail does reach the studio's own address, a second address can be
-- allow-listed to recover through, and the password can be changed in Supabase
-- directly — so it protected against nothing anyone could name, and cost a trip
-- to the SQL editor before the website could be used. The site has no traffic
-- yet, which is the window it would have covered. This file is the collapsed
-- version of what were three migrations; none of them had been applied
-- anywhere, so there is nothing to undo, and this way there are two files to
-- run rather than four.

alter table admin_emails
  add column if not exists claimed_at timestamptz;

-- What the claim endpoint asks. One answer for either kind of no — not listed,
-- or already claimed — so the endpoint cannot be used to find out which
-- addresses are on the list.
create or replace function studio_claim_allowed(p_email text)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from admin_emails
     where email = lower(p_email)
       and claimed_at is null
  );
$$;

-- The other half of one-shot, called once the login actually exists. Marking
-- it earlier would shut the door on a failed attempt and leave her outside it.
create or replace function mark_studio_claimed(p_email text)
returns void language sql security definer set search_path = public as $$
  update admin_emails set claimed_at = now() where email = lower(p_email);
$$;

-- Only the server may call these.
--
-- `from public`, not `from anon, authenticated`. Postgres grants EXECUTE on a
-- new function to PUBLIC, and those two roles inherit it from there — so
-- revoking it from them by name takes away a grant they never had and changes
-- nothing. The access-rule tests caught that on the first draft of this, when a
-- signed-in client could still reach these and open the door for themselves.
revoke all on function studio_claim_allowed(text) from public;
revoke all on function mark_studio_claimed(text) from public;

-- The claim endpoint is the only caller and it holds the service key.
-- `postgres` keeps access as the owner, which is what the SQL editor runs as.
grant execute on function studio_claim_allowed(text) to service_role;
grant execute on function mark_studio_claimed(text) to service_role;

comment on table admin_emails is
  'Addresses that may be the studio. An unclaimed row is claimed at '
  '/studio-setup by entering the address and a password; claimed_at then '
  'closes it. Listing an address grants nothing until someone claims it.';

comment on column admin_emails.claimed_at is
  'When the studio account for this address was created. Clear it to set the '
  'password again — that is how a lost studio password is recovered when no '
  'mail arrives.';
