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

-- Everything else a client's private life lives in. Each of these tables holds
-- one row for Ann and one for Boris, so "1" is the whole assertion: seeing 2
-- would mean seeing someone else's.
insert into results (test, expected, got, pass)
select 'A client sees only their own wardrobe', '1', count(*)::text, count(*) = 1
from wardrobe_items;

insert into results (test, expected, got, pass)
select 'A client sees only their own message thread', '1', count(*)::text, count(*) = 1
from messages;

insert into results (test, expected, got, pass)
select 'A client sees only notes on their own orders', '1', count(*)::text, count(*) = 1
from order_notes;

insert into results (test, expected, got, pass)
select 'A client sees only their own notifications', '1', count(*)::text, count(*) = 1
from notifications;

insert into results (test, expected, got, pass)
select 'A client sees only their own delivery address', '1', count(*)::text, count(*) = 1
from delivery_info;

-- The write side. Reading is not the only way to reach into another account:
-- filing a garment, or a message, under someone else's id would put content in
-- their portal that they did not put there.
do $$
declare blocked boolean;
begin
  begin
    insert into wardrobe_items (profile_id, name)
    values ('33333333-3333-3333-3333-333333333333', 'Planted coat');
    blocked := false;
  exception when others then blocked := true;
  end;
  insert into results (test, expected, got, pass)
  values ('A client cannot file a garment in another wardrobe', 'blocked',
          case when blocked then 'blocked' else 'GOT THROUGH' end, blocked);
end $$;

do $$
declare blocked boolean;
begin
  begin
    insert into messages (profile_id, sender, text)
    values ('33333333-3333-3333-3333-333333333333', 'client', 'Planted message');
    blocked := false;
  exception when others then blocked := true;
  end;
  insert into results (test, expected, got, pass)
  values ('A client cannot write into another thread', 'blocked',
          case when blocked then 'blocked' else 'GOT THROUGH' end, blocked);
end $$;

do $$
declare blocked boolean;
begin
  begin
    insert into notifications (audience, profile_id, kind, text)
    values ('client', '33333333-3333-3333-3333-333333333333', 'order_update', 'Planted alert');
    blocked := false;
  exception when others then blocked := true;
  end;
  insert into results (test, expected, got, pass)
  values ('A client cannot raise an alert in another inbox', 'blocked',
          case when blocked then 'blocked' else 'GOT THROUGH' end, blocked);
end $$;

-- ------------------------------------------------ becoming the studio (0011)
-- The allow-list is the gate, on its own: an unclaimed listed address may
-- claim the studio account, a claimed one may not, and nothing else opens it.
-- The one-time code 0009 introduced is gone — see 0011 for why — but the
-- one-shot part is the whole protection now, so it is the part to hold down.
reset role;

insert into admin_emails (email) values ('claim@test.invalid') on conflict do nothing;

insert into results (test, expected, got, pass)
select 'A listed, unclaimed address may claim the studio account', 'true',
       studio_claim_allowed('claim@test.invalid')::text,
       studio_claim_allowed('claim@test.invalid');

insert into results (test, expected, got, pass)
select 'The address is matched without regard to case', 'true',
       studio_claim_allowed('CLAIM@TEST.INVALID')::text,
       studio_claim_allowed('CLAIM@TEST.INVALID');

insert into results (test, expected, got, pass)
select 'An address that is not listed may not', 'false',
       studio_claim_allowed('stranger@test.invalid')::text,
       studio_claim_allowed('stranger@test.invalid') = false;

select mark_studio_claimed('claim@test.invalid');

insert into results (test, expected, got, pass)
select 'A claimed address may not be claimed again', 'false',
       studio_claim_allowed('claim@test.invalid')::text,
       studio_claim_allowed('claim@test.invalid') = false;

-- Which is how a lost password is recovered when no mail arrives: clear the
-- stamp and the row opens once more.
update admin_emails set claimed_at = null where email = 'claim@test.invalid';

insert into results (test, expected, got, pass)
select 'Clearing claimed_at re-opens it', 'true',
       studio_claim_allowed('claim@test.invalid')::text,
       studio_claim_allowed('claim@test.invalid');

-- The code is gone, and so is every way to set one.
insert into results (test, expected, got, pass)
select 'Nothing is left of the setup code', '0', count(*)::text, count(*) = 0
from pg_proc
where proname in ('set_studio_code', 'verify_studio_code', 'studio_code_hash', 'studio_code_required');

insert into results (test, expected, got, pass)
select 'And its column is gone from the allow-list', '0', count(*)::text, count(*) = 0
from information_schema.columns
where table_name = 'admin_emails' and column_name = 'setup_code_hash';

-- None of it is reachable from a browser: the claim endpoint holds the service
-- key, and a signed-in client must not be able to open or close the door.
set role authenticated;
select as_user(:ANN);
do $$
declare blocked boolean;
begin
  begin
    perform studio_claim_allowed('claim@test.invalid');
    blocked := false;
  exception when others then blocked := true;
  end;
  insert into results (test, expected, got, pass)
  values ('A signed-in client cannot ask whether an address may be claimed',
          'blocked', case when blocked then 'blocked' else 'GOT THROUGH' end, blocked);
end $$;

do $$
declare blocked boolean;
begin
  begin
    perform mark_studio_claimed('claim@test.invalid');
    blocked := false;
  exception when others then blocked := true;
  end;
  insert into results (test, expected, got, pass)
  values ('A signed-in client cannot mark an address claimed', 'blocked',
          case when blocked then 'blocked' else 'GOT THROUGH' end, blocked);
end $$;

do $$
declare blocked int;
begin
  -- The allow-list itself was never readable by anyone but the server, and
  -- that is what stops a client adding their own address to it.
  select count(*) into blocked from admin_emails;
  insert into results (test, expected, got, pass)
  values ('A signed-in client sees nothing in the allow-list', '0',
          blocked::text, blocked = 0);
exception when others then
  insert into results (test, expected, got, pass)
  values ('A signed-in client sees nothing in the allow-list', '0',
          'refused outright', true);
end $$;

-- ------------------------------------------------------------------ photos
-- Uploads are the one private thing that does not live in a table. The folder
-- name is the permission: client-photos/<uuid>/… . So the test is whether Ann
-- can see into, write into, or delete out of Boris's folder.
insert into results (test, expected, got, pass)
select 'A client sees only their own photo folder', '1', count(*)::text, count(*) = 1
from storage.objects where bucket_id = 'client-photos';

do $$
declare blocked boolean;
begin
  begin
    insert into storage.objects (bucket_id, name, owner)
    values ('client-photos', '33333333-3333-3333-3333-333333333333/planted.jpg',
            '22222222-2222-2222-2222-222222222222');
    blocked := false;
  exception when others then blocked := true;
  end;
  insert into results (test, expected, got, pass)
  values ('A client cannot upload into another photo folder', 'blocked',
          case when blocked then 'blocked' else 'GOT THROUGH' end, blocked);
end $$;

do $$
declare gone int;
begin
  delete from storage.objects
  where name = '33333333-3333-3333-3333-333333333333/boris.jpg';
  get diagnostics gone = row_count;
  insert into results (test, expected, got, pass)
  values ('A client cannot delete another client''s photo', '0', gone::text, gone = 0);
end $$;

-- The rail's photographs are the opposite case: they are on a public page, so
-- everyone may read them and only the studio may put them there.
insert into results (test, expected, got, pass)
select 'A client can read the rail photographs', '1', count(*)::text, count(*) = 1
from storage.objects where bucket_id = 'stock-photos';

do $$
declare blocked boolean;
begin
  begin
    insert into storage.objects (bucket_id, name) values ('stock-photos', 'rail/fake.jpg');
    blocked := false;
  exception when others then blocked := true;
  end;
  insert into results (test, expected, got, pass)
  values ('A client cannot add to the public rail photographs', 'blocked',
          case when blocked then 'blocked' else 'GOT THROUGH' end, blocked);
end $$;

-- And cannot edit what they can see: a client may mark their own alert read,
-- not rewrite what it says for someone else.
do $$
declare touched int;
begin
  update notifications set read = true
  where profile_id = '33333333-3333-3333-3333-333333333333';
  get diagnostics touched = row_count;
  insert into results (test, expected, got, pass)
  values ('A client cannot mark another client''s alerts read', '0',
          touched::text, touched = 0);
end $$;

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
