-- The setup code goes.
--
-- 0009 added it as a second factor for claiming the studio account, and 0010
-- made it optional. The studio's answer, twice: the recovery email does reach
-- her, there is a second allow-listed address to fall back on, and in the worst
-- case the password can be changed in Supabase directly or with a line of code.
-- A factor nobody uses is not protection, it is furniture — and it was two
-- functions, a column and a field on a form that had to be explained every time
-- anyone looked at the page.
--
-- So the allow-list is the gate, on its own:
--
--   on admin_emails, unclaimed  ->  this address may claim the studio account
--   claimed                     ->  it may not, and cannot be claimed twice
--
-- The one-shot part stays. `claimed_at` is what stops a second person taking
-- the account after she has set it up, and clearing it is how a lost password
-- is recovered without mail:
--
--     delete from auth.users where email = 'her@address';
--     update admin_emails set claimed_at = null where email = 'her@address';
--
-- and then /studio-setup again, with a new password.
--
-- Written forward rather than by editing 0009 and 0010, because those are
-- pushed and may already have been run: every drop here is guarded, so this
-- applies cleanly whether they were or not.

-- What the claim endpoint asks now. The name says what it means, which the old
-- `verify_studio_code` would have stopped doing the moment the code left.
create or replace function studio_claim_allowed(p_email text)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from admin_emails
     where email = lower(p_email)
       and claimed_at is null
  );
$$;

revoke all on function studio_claim_allowed(text) from public;
grant execute on function studio_claim_allowed(text) to service_role;

-- `mark_studio_claimed` stays as it is: it is the other half of one-shot.

drop function if exists verify_studio_code(text, text);
drop function if exists studio_code_required(text);
drop function if exists set_studio_code(text, text);
drop function if exists studio_code_hash(text, text);

alter table admin_emails drop column if exists setup_code_hash;

comment on table admin_emails is
  'Addresses that may be the studio. An unclaimed row is claimed at '
  '/studio-setup by entering the address and a password; claimed_at then '
  'closes it. Clear claimed_at to set the password again.';
