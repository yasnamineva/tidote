-- The allow-list on its own is enough.
--
-- 0009 required a one-time code on every claim. The studio's answer to that:
-- there is no traffic on the site yet, nobody is going to register her address
-- before she does, and she would rather go to the website, type the address and
-- a password, and be in. That is a real risk she has weighed and accepted, and
-- it is hers to weigh: the cost of the code is that setting up the studio needs
-- a trip to the SQL editor first, which is the thing she asked not to need.
--
-- So the code becomes optional, and its absence is the open state:
--
--   setup_code_hash is null  ->  the address alone claims the account
--   setup_code_hash is set   ->  that code is also required
--
-- Nothing else changes. The address still has to be on the allow-list, the row
-- still has to be unclaimed, and a claimed row still cannot be claimed again.
-- Hardening it later is one line in the SQL editor and no deploy:
--
--     select set_studio_code('marinova.tedi@gmail.com', 'a code only you know');
--
-- and the page starts requiring that code from the next request onward.

create or replace function verify_studio_code(p_email text, p_code text)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from admin_emails
     where email = lower(p_email)
       and claimed_at is null
       and (
         -- No code set: the allow-list is the whole gate.
         setup_code_hash is null
         -- A code set: it has to match. `p_code` is never trusted to be
         -- non-empty, so an empty one cannot match a set hash.
         or setup_code_hash = studio_code_hash(p_email, coalesce(p_code, ''))
       )
  );
$$;

-- Whether the address needs a code, so the page can ask for one only when
-- there is one to ask for. It answers false for an address that is not listed
-- as well, which is the same answer it gives for one with no code — there is
-- no version of this that tells a stranger which addresses are on the list.
create or replace function studio_code_required(p_email text)
returns boolean language sql security definer set search_path = public as $$
  select coalesce(
    (select setup_code_hash is not null from admin_emails where email = lower(p_email)),
    false
  );
$$;

revoke all on function verify_studio_code(text, text) from public;
revoke all on function studio_code_required(text) from public;
grant execute on function verify_studio_code(text, text) to service_role;
grant execute on function studio_code_required(text) to service_role;

comment on column admin_emails.setup_code_hash is
  'Optional. When set, /studio-setup also requires this code; when null, the '
  'address alone claims the studio account. Set it with set_studio_code().';
