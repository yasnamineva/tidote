-- Row-level security.
--
-- Every table is denied by default and opened one policy at a time. The pattern
-- throughout is "the owner, or the studio": `profile_id = auth.uid() or
-- is_admin()`. Nothing here trusts the browser — the React code decides what to
-- *show*, this decides what a request can *reach*.

alter table profiles         enable row level security;
alter table admin_emails     enable row level security;
alter table measurements     enable row level security;
alter table delivery_info    enable row level security;
alter table orders           enable row level security;
alter table order_notes      enable row level security;
alter table wardrobe_items   enable row level security;
alter table messages         enable row level security;
alter table notifications    enable row level security;
alter table ready_pieces     enable row level security;
alter table studio_settings  enable row level security;
alter table availability     enable row level security;
alter table bookings         enable row level security;
alter table expenses         enable row level security;
alter table compliance_items enable row level security;
alter table heartbeat        enable row level security;

-- admin_emails: no policies at all. Only the signup trigger reads it, and that
-- runs as definer. Nobody can list who the admins are.

-- ---------------------------------------------------------------- profiles

create policy "read own profile or all as studio" on profiles
  for select using (id = auth.uid() or is_admin());

create policy "update own profile" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "studio manages profiles" on profiles
  for all using (is_admin()) with check (is_admin());

-- ------------------------------------------------- measurements and delivery

create policy "own measurements" on measurements
  for all using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid() or is_admin());

create policy "own delivery" on delivery_info
  for all using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid() or is_admin());

-- ---------------------------------------------------------------- orders

create policy "read own orders" on orders
  for select using (profile_id = auth.uid() or is_admin());

create policy "place own order" on orders
  for insert with check (profile_id = auth.uid() or is_admin());

create policy "update own order" on orders
  for update using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid() or is_admin());

/*
 * A row policy can say *which rows* you may write, not which columns — so the
 * policy above, on its own, would let a client set the price of their own
 * order. Column privileges cannot fix it either, because the studio signs in
 * through the same `authenticated` role.
 *
 * So the columns that are the studio's to decide are guarded here. A client may
 * edit their own photos, their permission and their notes; the money, the
 * production stage, the review decision and the return are refused unless the
 * studio is the one asking.
 */
create function guard_order_columns() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- A null uid means the caller is a role that bypasses row-level security --
  -- the service key, used by the seed script and the studio's own routes. Note
  -- that a trigger runs even for those, so without this the seed data would be
  -- quietly rewritten on its way in. It cannot be an anonymous visitor: the
  -- policy on this table already refused them, since `profile_id = auth.uid()`
  -- is never true for a null uid.
  if auth.uid() is null or is_admin() then
    return new;
  end if;
  if new.total is distinct from old.total
     or new.status is distinct from old.status
     or new.review_status is distinct from old.review_status
     or new.eta is distinct from old.eta
     or new.placed_on is distinct from old.placed_on
     or new.returned_on is distinct from old.returned_on
     or new.profile_id is distinct from old.profile_id then
    raise exception 'Only the studio can change the price, stage or status of an order';
  end if;
  return new;
end;
$$;

create trigger orders_guard_studio_columns
  before update on orders
  for each row execute function guard_order_columns();

/* The same reasoning for a new order: a client cannot quote themselves. */
create function guard_new_order() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or is_admin() then
    return new;
  end if;
  new.review_status := 'pending';
  new.status        := 'received';
  new.total         := 'Quote pending';
  new.eta           := 'To be confirmed';
  new.returned_on   := null;
  return new;
end;
$$;

create trigger orders_guard_new
  before insert on orders
  for each row execute function guard_new_order();

create policy "studio deletes orders" on orders
  for delete using (is_admin());

create policy "notes on reachable orders" on order_notes
  for all using (
    exists (select 1 from orders o where o.id = order_notes.order_id
            and (o.profile_id = auth.uid() or is_admin()))
  ) with check (
    exists (select 1 from orders o where o.id = order_notes.order_id
            and (o.profile_id = auth.uid() or is_admin()))
  );

-- ------------------------------------------------- wardrobe, messages, alerts

create policy "own wardrobe" on wardrobe_items
  for all using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid() or is_admin());

create policy "own messages" on messages
  for all using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid() or is_admin());

create policy "own notifications" on notifications
  for select using (
    (audience = 'client' and profile_id = auth.uid()) or (is_admin())
  );

-- Both sides raise alerts for the other: a client placing an order notifies the
-- studio, and the studio notifies the client back. A client may only raise one
-- addressed to the studio, and only about themselves — otherwise anyone signed
-- in could write into someone else's inbox.
create policy "raise notifications" on notifications
  for insert with check (
    is_admin() or (audience = 'admin' and profile_id = auth.uid())
  );

create policy "mark own notifications read" on notifications
  for update using (
    (audience = 'client' and profile_id = auth.uid()) or (is_admin())
  ) with check (
    (audience = 'client' and profile_id = auth.uid()) or (is_admin())
  );

-- ---------------------------------------------------------------- the rail

-- The table is the studio's alone. Everyone else goes through public_stock,
-- which has no column for the buyer's name or the studio's notes.
create policy "studio manages stock" on ready_pieces
  for all using (is_admin()) with check (is_admin());

grant select on public_stock to anon, authenticated;

-- ---------------------------------------------------------------- studio only

create policy "studio settings" on studio_settings
  for all using (is_admin()) with check (is_admin());

create policy "studio expenses" on expenses
  for all using (is_admin()) with check (is_admin());

create policy "studio compliance" on compliance_items
  for all using (is_admin()) with check (is_admin());

-- A client picking a fitting slot has to be able to see which days are open.
create policy "read availability" on availability
  for select using (auth.uid() is not null);

create policy "studio sets availability" on availability
  for all using (is_admin()) with check (is_admin());

-- Times that are taken must be visible to everyone choosing a slot, but who
-- booked them is not — the client-facing query selects date and time only, and
-- the studio's calendar is the only place a name is joined in.
create policy "read bookings" on bookings
  for select using (auth.uid() is not null);

create policy "book own fitting" on bookings
  for insert with check (profile_id = auth.uid() or is_admin());

create policy "studio manages bookings" on bookings
  for all using (is_admin()) with check (is_admin());

create policy "cancel own booking" on bookings
  for delete using (profile_id = auth.uid() or is_admin());

-- ---------------------------------------------------------------- heartbeat

-- Written by the daily cron with the service key, which bypasses RLS. No policy
-- means no one else can touch it.
