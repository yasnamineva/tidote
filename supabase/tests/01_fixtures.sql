-- Supabase grants these automatically; the stub has to do it by hand, or
-- everything would fail on privileges before RLS ever got a say.
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth, storage to anon, authenticated, service_role;
grant execute on all functions in schema auth to anon, authenticated, service_role;
grant all on all tables in schema public to authenticated, service_role;
grant all on all sequences in schema public to authenticated, service_role;
grant select on public_stock to anon, authenticated;
revoke all on admin_emails from anon, authenticated;

-- Three accounts. The signup trigger decides the roles.
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'yasna.mnv@gmail.com', '{"name":"Studio"}'),
  ('22222222-2222-2222-2222-222222222222', 'ann@example.com',     '{"name":"Ann"}'),
  ('33333333-3333-3333-3333-333333333333', 'boris@example.com',   '{"name":"Boris"}');

insert into measurements (profile_id) values
  ('22222222-2222-2222-2222-222222222222'), ('33333333-3333-3333-3333-333333333333');

-- Ann has an address; Boris deliberately does not, so the mapper's fallback to
-- an empty delivery record gets exercised rather than assumed.
insert into delivery_info (profile_id, address, city, postal_code, phone)
values ('22222222-2222-2222-2222-222222222222', 'ul. Shishman 14', 'Sofia', '1000', '+359 88 000 0000');

insert into orders (profile_id, piece, category, status, review_status, total, eta)
values
  ('22222222-2222-2222-2222-222222222222','Ann Jacket','Jacket','delivered','accepted','€400','2026-05-01'),
  ('33333333-3333-3333-3333-333333333333','Boris Pants','Pants','in_production','accepted','€300','2026-06-01');

insert into ready_pieces (name, category, size, price, status, held_for, notes) values
  ('On the rail','Jacket','M',230,'available','',''),
  ('Already gone','Hoodie','S',190,'sold','Kaloyan Ivanov','paid cash');
