-- Supabase grants these automatically; the stub has to do it by hand, or
-- everything would fail on privileges before RLS ever got a say.
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth, storage to anon, authenticated, service_role;
grant execute on all functions in schema auth to anon, authenticated, service_role;
grant all on all tables in schema public to authenticated, service_role;
grant all on all sequences in schema public to authenticated, service_role;
grant select on public_stock to anon, authenticated;
-- Supabase grants these too; the stub does not, and without them the storage
-- tests fail on privileges before any policy is consulted.
grant all on storage.objects to anon, authenticated, service_role;
grant select on storage.buckets to anon, authenticated, service_role;
revoke all on admin_emails from anon, authenticated;

-- The suite brings its own studio address rather than reusing whichever one
-- 0004 carries. Otherwise changing the real sign-in address silently breaks
-- these tests, which is exactly what it did.
insert into admin_emails (email) values ('studio@test.invalid')
on conflict (email) do nothing;

-- Three accounts. Everyone arrives a client — that is the point of 0005.
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'studio@test.invalid', '{"name":"Studio"}'),
  ('22222222-2222-2222-2222-222222222222', 'ann@example.com',     '{"name":"Ann"}'),
  ('33333333-3333-3333-3333-333333333333', 'boris@example.com',   '{"name":"Boris"}');

-- Promotion is what create-admin does with the service key, after checking the
-- allow-list. Nothing a browser can reach performs this step.
update profiles set role = 'admin'
where email = 'studio@test.invalid'
  and exists (select 1 from admin_emails a where a.email = profiles.email);

-- The trigger creates these now, so the fixtures only fill one in.

-- Ann has an address; Boris's row exists but stays empty.
update delivery_info
set address = 'ul. Shishman 14', city = 'Sofia', postal_code = '1000',
    phone = '+359 88 000 0000'
where profile_id = '22222222-2222-2222-2222-222222222222';

insert into orders (profile_id, piece, category, status, review_status, total, eta)
values
  ('22222222-2222-2222-2222-222222222222','Ann Jacket','Jacket','delivered','accepted','€400','2026-05-01'),
  ('33333333-3333-3333-3333-333333333333','Boris Pants','Pants','in_production','accepted','€300','2026-06-01');

insert into ready_pieces (name, category, size, price, status, held_for, notes) values
  ('On the rail','Jacket','M',230,'available','',''),
  ('Already gone','Hoodie','S',190,'sold','Kaloyan Ivanov','paid cash');

-- Both clients own one of each private thing, so an isolation test that counts
-- rows proves the policy and not the emptiness of the table: if Ann can see
-- two wardrobe items, she is seeing Boris's.
insert into wardrobe_items (profile_id, name, category, notes) values
  ('22222222-2222-2222-2222-222222222222','Ann Coat','Jacket',''),
  ('33333333-3333-3333-3333-333333333333','Boris Tee','T-Shirt','');

insert into messages (profile_id, sender, text) values
  ('22222222-2222-2222-2222-222222222222','client','Ann asks a question'),
  ('33333333-3333-3333-3333-333333333333','client','Boris asks a question');

insert into order_notes (order_id, author, text)
select id, 'client', 'note on ' || piece from orders;

insert into notifications (audience, profile_id, kind, text) values
  ('client','22222222-2222-2222-2222-222222222222','order_update','Ann''s piece moved on'),
  ('client','33333333-3333-3333-3333-333333333333','order_update','Boris''s piece moved on');

-- Two private uploads and one rail photograph. Inserted here, as the owner, so
-- that the isolation tests can run as one client and still have someone else's
-- file to fail to reach.
insert into storage.objects (bucket_id, name, owner) values
  ('client-photos', '22222222-2222-2222-2222-222222222222/ann.jpg',
   '22222222-2222-2222-2222-222222222222'),
  ('client-photos', '33333333-3333-3333-3333-333333333333/boris.jpg',
   '33333333-3333-3333-3333-333333333333'),
  ('stock-photos', 'rail/jacket.jpg', null);

