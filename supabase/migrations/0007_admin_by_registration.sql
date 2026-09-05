-- Becoming the studio from the website, once.
--
-- 0005 took this decision away from the signup trigger, because at that point
-- anyone could register as support@tidoteatelier.com and arrive inside the
-- studio panel. Promotion moved to `npm run create-admin`.
--
-- That is the wrong place for a one-time job: the person who owns the atelier
-- should be able to set her own password on her own website, without a
-- terminal. So the allow-list grants studio access again -- but only after the
-- address has been confirmed.
--
-- That is the whole difference from the version 0005 removed. Listing an
-- address says who *may* become the studio; reading the mail sent to it is what
-- actually does it. An impostor who registers the address first gets a client
-- account and a promotion that never arrives, because the confirmation link
-- goes to the mailbox, not to them.

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, role, name, email)
  values (
    new.id,
    -- Already confirmed at creation happens two ways: "auto confirm" in the
    -- Supabase dashboard, and the studio's own New Client route, which passes
    -- email_confirm because it has just met the person.
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

-- The ordinary path: register, get the mail, click the link. Supabase stamps
-- email_confirmed_at, and that stamp is the promotion.
create function promote_on_confirm() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from admin_emails where email = new.email) then
    update profiles set role = 'admin'::user_role where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_confirmed
  after update on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function promote_on_confirm();

comment on table admin_emails is
  'Addresses allowed to become the studio. One is promoted when its owner '
  'registers and confirms it. Listing an address grants nothing until then.';
