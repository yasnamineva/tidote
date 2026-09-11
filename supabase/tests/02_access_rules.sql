\set ANN    '''22222222-2222-2222-2222-222222222222'''
\set BORIS  '''33333333-3333-3333-3333-333333333333'''
\set STUDIO '''11111111-1111-1111-1111-111111111111'''

create table if not exists results (n serial, test text, expected text, got text, pass boolean);
truncate results;
-- helper: run as a signed-in client
create or replace function as_user(uid text) returns void language plpgsql as $$
begin perform set_config('request.jwt.claim.sub', uid, false); end $$;

grant all on results to authenticated, anon;
grant usage, select on sequence results_n_seq to authenticated, anon;
grant execute on function as_user(text) to authenticated, anon;

------------------------------------------------------- how accounts come out
insert into results (test, expected, got, pass)
select 'Signing up creates a client, never studio', 'client', role::text, role = 'client'
from profiles where email = 'ann@example.com';

-- Registering an allow-listed address does not, on its own, make you the
-- studio: 0007 waits for the address to be confirmed. Someone who squats
-- support@... gets a client account and a promotion that never arrives.
do $$
declare r text;
begin
  insert into admin_emails (email) values ('studio@test.invalid2') on conflict do nothing;

  insert into auth.users (id, email, raw_user_meta_data)
  values ('44444444-4444-4444-4444-444444444444', 'studio@test.invalid2', '{"name":"Impostor"}');
  select role::text into r from profiles where id = '44444444-4444-4444-4444-444444444444';
  insert into results (test, expected, got, pass)
  values ('An unconfirmed allow-listed address is only a client', 'client', r, r = 'client');

  -- Reading the mail is the promotion.
  update auth.users set email_confirmed_at = now()
  where id = '44444444-4444-4444-4444-444444444444';
  select role::text into r from profiles where id = '44444444-4444-4444-4444-444444444444';
  insert into results (test, expected, got, pass)
  values ('Confirming an allow-listed address makes it studio', 'admin', r, r = 'admin');
end $$;

-- Confirming an address nobody listed proves nothing and grants nothing.
do $$
declare r text;
begin
  insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data)
  values ('55555555-5555-5555-5555-555555555555', 'stranger@example.com', now(), '{"name":"Stranger"}');
  select role::text into r from profiles where id = '55555555-5555-5555-5555-555555555555';
  insert into results (test, expected, got, pass)
  values ('A confirmed address that is not allow-listed stays a client', 'client', r, r = 'client');
end $$;

-- 0006. Row-level security says which *rows* you may write, so `update own
-- profile` let a client rewrite their own `role` and become the studio.
do $$
declare r text; msg text;
begin
  set role authenticated;
  perform as_user('22222222-2222-2222-2222-222222222222');
  begin
    update profiles set role = 'admin' where id = '22222222-2222-2222-2222-222222222222';
    msg := 'allowed';
  exception when others then msg := 'refused';
  end;
  reset role;
  select role::text into r from profiles where id = '22222222-2222-2222-2222-222222222222';
  insert into results (test, expected, got, pass)
  values ('A client cannot promote themselves to studio', 'refused|client',
          msg || '|' || r, msg = 'refused' and r = 'client');
end $$;

-- The guard must not make the profile read-only: your own name is yours.
do $$
declare got text; msg text;
begin
  set role authenticated;
  perform as_user('22222222-2222-2222-2222-222222222222');
  begin
    update profiles set name = 'Ann Renamed', phone = '+359 88 111 1111'
    where id = '22222222-2222-2222-2222-222222222222';
    msg := 'allowed';
  exception when others then msg := 'refused';
  end;
  reset role;
  select name into got from profiles where id = '22222222-2222-2222-2222-222222222222';
  insert into results (test, expected, got, pass)
  values ('A client can still edit their own name', 'Ann Renamed', got || '/' || msg,
          got = 'Ann Renamed' and msg = 'allowed');
end $$;

insert into results (test, expected, got, pass)
select 'Signing up creates the measurement sheet', '1', count(*)::text, count(*) = 1
from measurements where profile_id = '44444444-4444-4444-4444-444444444444';

insert into results (test, expected, got, pass)
select 'Signing up creates the delivery record', '1', count(*)::text, count(*) = 1
from delivery_info where profile_id = '44444444-4444-4444-4444-444444444444';

------------------------------------------------------------------ isolation
set role authenticated;
select as_user(:ANN);
insert into results (test, expected, got, pass)
select 'A client sees only their own orders', '1', count(*)::text, count(*) = 1 from orders;

insert into results (test, expected, got, pass)
select 'A client cannot read another client''s measurements', '1', count(*)::text, count(*) = 1
from measurements;

insert into results (test, expected, got, pass)
select 'A client cannot list other profiles', '1', count(*)::text, count(*) = 1 from profiles;

------------------------------------------------- the money guard (the big one)
do $$
declare ok boolean := false;
begin
  begin
    update orders set total = '€1' where profile_id = auth.uid();
    ok := false;                       -- got through: that is the bug
  exception when others then ok := true;
  end;
  insert into results (test, expected, got, pass)
  values ('A client cannot change the price of their own order', 'refused',
          case when ok then 'refused' else 'ALLOWED' end, ok);
end $$;

do $$
declare ok boolean := false;
begin
  begin
    update orders set status = 'ready' where profile_id = auth.uid();
    ok := false;
  exception when others then ok := true;
  end;
  insert into results (test, expected, got, pass)
  values ('A client cannot move their own order''s stage', 'refused',
          case when ok then 'refused' else 'ALLOWED' end, ok);
end $$;

do $$
declare ok boolean := false;
begin
  begin
    update orders set profile_id = '33333333-3333-3333-3333-333333333333'
    where profile_id = auth.uid();
    ok := false;
  exception when others then ok := true;
  end;
  insert into results (test, expected, got, pass)
  values ('A client cannot hand their order to someone else', 'refused',
          case when ok then 'refused' else 'ALLOWED' end, ok);
end $$;

do $$
declare ok boolean := false;
begin
  begin
    update orders set returned_on = current_date where profile_id = auth.uid();
    ok := false;
  exception when others then ok := true;
  end;
  insert into results (test, expected, got, pass)
  values ('A client cannot mark their own order returned', 'refused',
          case when ok then 'refused' else 'ALLOWED' end, ok);
end $$;

-- what they ARE allowed to do
update orders set wear_photos = array['client-photos/x.jpg'], photo_consent = true
where profile_id = auth.uid();
insert into results (test, expected, got, pass)
select 'A client can set their own photos and consent', 'true', photo_consent::text, photo_consent
from orders where profile_id = auth.uid();

-- a new order cannot be self-quoted
insert into orders (profile_id, piece, category, total, review_status, status)
values (auth.uid(), 'Self-priced', 'Jacket', '€1', 'accepted', 'delivered');
insert into results (test, expected, got, pass)
select 'A new order is forced to pending / no price',
       'pending|Quote pending', review_status || '|' || total,
       review_status = 'pending' and total = 'Quote pending'
from orders where piece = 'Self-priced';

------------------------------------------------------------- notification inbox
do $$
declare ok boolean := false;
begin
  begin
    insert into notifications (audience, profile_id, kind, text, href)
    values ('client', '33333333-3333-3333-3333-333333333333', 'message', 'spam', '/');
    ok := false;
  exception when others then ok := true;
  end;
  insert into results (test, expected, got, pass)
  values ('A client cannot write into another client''s inbox', 'refused',
          case when ok then 'refused' else 'ALLOWED' end, ok);
end $$;

--------------------------------------------------------------------- the rail
do $$
declare n int;
begin
  begin
    select count(*) into n from ready_pieces;
  exception when others then n := -1;
  end;
  insert into results (test, expected, got, pass)
  values ('A client cannot read the rail table directly', '0 rows or refused',
          n::text, n <= 0);
end $$;

reset role;
set role anon;
insert into results (test, expected, got, pass)
select 'A stranger sees only unsold stock', '1', count(*)::text, count(*) = 1 from public_stock;

do $$
declare ok boolean := false;
begin
  begin
    perform held_for from public_stock limit 1;
    ok := false;
  exception when undefined_column then ok := true;
       when others then ok := true;
  end;
  insert into results (test, expected, got, pass)
  values ('The buyer''s name is not even a column out there', 'no such column',
          case when ok then 'no such column' else 'EXPOSED' end, ok);
end $$;

do $$
declare n int;
begin
  begin
    select count(*) into n from ready_pieces;
  exception when others then n := -1;
  end;
  insert into results (test, expected, got, pass)
  values ('A stranger cannot reach the rail table', 'refused', n::text, n <= 0);
end $$;

-------------------------------------------------------------- enquiries (0008)
-- They hold an email address and a phone number belonging to somebody who has
-- not signed up for anything, so the table has exactly one policy.
reset role;
insert into enquiries (name, email, message, piece_name)
values ('Stranger', 'stranger@example.com', 'Is the cargo set still here?', 'Olive Cargo Set');

do $$
declare n int; msg text;
begin
  set role anon;
  begin
    select count(*) into n from enquiries;
    msg := 'allowed';
  exception when others then n := -1; msg := 'refused';
  end;
  reset role;
  insert into results (test, expected, got, pass)
  values ('A stranger cannot read the enquiries', '0 rows', msg || ' ' || n::text, n <= 0);
end $$;

do $$
declare msg text;
begin
  set role authenticated;
  perform as_user('22222222-2222-2222-2222-222222222222');
  begin
    insert into enquiries (name, message) values ('Ann', 'sneaking one in');
    msg := 'allowed';
  exception when others then msg := 'refused';
  end;
  reset role;
  insert into results (test, expected, got, pass)
  values ('A client cannot write an enquiry directly', 'refused', msg, msg = 'refused');
end $$;

do $$
declare n int;
begin
  set role authenticated;
  perform as_user('11111111-1111-1111-1111-111111111111');
  select count(*) into n from enquiries;
  reset role;
  insert into results (test, expected, got, pass)
  values ('The studio reads the enquiries', '1', n::text, n = 1);
end $$;

------------------------------------------------------------------- the studio
reset role;
set role authenticated;
select as_user(:STUDIO);
insert into results (test, expected, got, pass)
select 'The studio sees every client''s orders', '3', count(*)::text, count(*) = 3 from orders;

update orders set total = '€450', status = 'shipped'
where piece = 'Ann Jacket';
insert into results (test, expected, got, pass)
select 'The studio can price and move an order', '€450|shipped', total || '|' || status,
       total = '€450' and status = 'shipped'
from orders where piece = 'Ann Jacket';

insert into results (test, expected, got, pass)
select 'The studio sees the private rail columns', '2', count(*)::text, count(*) = 2
from ready_pieces;

reset role;
