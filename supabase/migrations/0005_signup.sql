-- Two ways to get an account, and one way to become the studio.
--
-- A client can now register themselves, which changes what the signup trigger
-- is allowed to decide. Before this, it read `admin_emails` and handed out the
-- admin role to anyone whose address appeared there — fine when the studio was
-- the only one who could create accounts, and a hole the moment strangers can.
-- Someone registering as support@tidoteatelier.com would have arrived inside
-- the studio panel. Email confirmation would usually catch that, but a setting
-- in a dashboard is the wrong last line of defence.
--
-- So the trigger no longer grants admin at all. Everyone who signs up is a
-- client. `npm run create-admin` promotes, using the service key and checking
-- the allow-list first — a decision made on the server, where it cannot be
-- spoofed by anything typed into a form.

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, role, name, email)
  values (
    new.id,
    'client'::user_role,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, '')
  );

  -- Both routes in should produce the same account. The studio's New Client
  -- form used to create these two rows itself, which meant a self-registered
  -- client would have arrived without them.
  insert into measurements (profile_id) values (new.id);
  insert into delivery_info (profile_id) values (new.id);

  return new;
end;
$$;

-- The allow-list is still what create-admin checks before promoting, so it
-- stays. It is now a list of who *may* be made studio, not who automatically is.
comment on table admin_emails is
  'Addresses permitted to be promoted to studio by scripts/create-admin.mjs. '
  'Listing an address grants nothing on its own.';
