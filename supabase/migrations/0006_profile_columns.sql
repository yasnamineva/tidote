-- A client could make themselves the studio.
--
-- `update own profile` lets a signed-in person write their own row, and
-- row-level security restricts *rows*, not *columns* -- the check
-- `id = auth.uid()` is just as true after `role` changes as before it. So
--
--   supabase.from('profiles').update({ role: 'admin' }).eq('id', myId)
--
-- from any client's browser console made them the studio: every other client's
-- measurements, addresses, orders and photographs, plus the export button.
--
-- The same trap was already handled for orders in 0002 (`guard_order_columns`,
-- so a client cannot price their own commission). Profiles never got the
-- equivalent, and `role` is the more valuable column of the two.
--
-- The rule the policy cannot express: you may edit yourself, but not what you
-- are.

create function guard_profile_columns() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- A null uid is a role that bypasses row-level security altogether -- the
  -- service key, used by the seed, create-admin, the studio's own routes, and
  -- the signup triggers. Those are decisions already made on the server.
  if auth.uid() is null or is_admin() then return new; end if;

  if new.role is distinct from old.role then
    raise exception 'Only the studio can change a role';
  end if;
  -- The address is the account's identity and is what the allow-list matches
  -- on, so it is not a field to leave writable either. Changing it belongs to
  -- Supabase Auth, which re-confirms the new one.
  if new.email is distinct from old.email then
    raise exception 'Change your email through your account, not this record';
  end if;
  if new.is_demo is distinct from old.is_demo then
    raise exception 'Only the studio can change the demo flag';
  end if;

  return new;
end;
$$;

create trigger guard_profile_columns_trigger
  before update on profiles
  for each row execute function guard_profile_columns();
