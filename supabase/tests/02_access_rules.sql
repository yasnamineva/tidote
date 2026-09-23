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

-- ------------------------------------------------- becoming the studio (0009)
-- The allow-list says who may be the studio; a one-time code proves it is
-- them. Every wrong answer has to look the same from outside, or the endpoint
-- that calls this becomes a way to find out which addresses are listed.
reset role;

insert into admin_emails (email) values ('claim@test.invalid') on conflict do nothing;

-- 0010 made the code optional, and its absence the open state: on a site with
-- no traffic, the studio would rather type an address and a password than visit
-- the SQL editor first. So a listed row with no code set opens with the address
-- alone, and asking for a code on it is not an error either.
insert into results (test, expected, got, pass)
select 'A listed address with no code set opens on the address alone', 'true',
       verify_studio_code('claim@test.invalid', '')::text,
       verify_studio_code('claim@test.invalid', '');

insert into results (test, expected, got, pass)
select 'And still opens if a code is offered when none is needed', 'true',
       verify_studio_code('claim@test.invalid', 'anything at all')::text,
       verify_studio_code('claim@test.invalid', 'anything at all');

insert into results (test, expected, got, pass)
select 'An address with no code does not need one', 'false',
       studio_code_required('claim@test.invalid')::text,
       studio_code_required('claim@test.invalid') = false;

select set_studio_code('claim@test.invalid', 'correct horse battery');

insert into results (test, expected, got, pass)
select 'The code is stored hashed, never as itself', 'true',
       (setup_code_hash is not null
        and setup_code_hash <> 'correct horse battery'
        and length(setup_code_hash) = 64)::text,
       setup_code_hash is not null
        and setup_code_hash <> 'correct horse battery'
        and length(setup_code_hash) = 64
from admin_emails where email = 'claim@test.invalid';

insert into results (test, expected, got, pass)
select 'The right code on a listed address opens it', 'true',
       verify_studio_code('claim@test.invalid', 'correct horse battery')::text,
       verify_studio_code('claim@test.invalid', 'correct horse battery');

insert into results (test, expected, got, pass)
select 'The address is matched without regard to case', 'true',
       verify_studio_code('CLAIM@TEST.INVALID', 'correct horse battery')::text,
       verify_studio_code('CLAIM@TEST.INVALID', 'correct horse battery');

insert into results (test, expected, got, pass)
select 'A wrong code does not', 'false',
       verify_studio_code('claim@test.invalid', 'correct horse batteryy')::text,
       verify_studio_code('claim@test.invalid', 'correct horse batteryy') = false;

-- The open state must not leak into the hardened one: once a code is set, the
-- empty string is a wrong code like any other.
insert into results (test, expected, got, pass)
select 'Nor an empty one, once a code has been set', 'false',
       verify_studio_code('claim@test.invalid', '')::text,
       verify_studio_code('claim@test.invalid', '') = false;

insert into results (test, expected, got, pass)
select 'And the page is told that this address needs a code', 'true',
       studio_code_required('claim@test.invalid')::text,
       studio_code_required('claim@test.invalid');

insert into results (test, expected, got, pass)
select 'An address that is not listed needs nothing, because it opens nothing',
       'false', studio_code_required('stranger@test.invalid')::text,
       studio_code_required('stranger@test.invalid') = false;

insert into results (test, expected, got, pass)
select 'An address that is not listed does not, whatever the code', 'false',
       verify_studio_code('stranger@test.invalid', 'correct horse battery')::text,
       verify_studio_code('stranger@test.invalid', 'correct horse battery') = false;

insert into results (test, expected, got, pass)
select 'An address that is not listed is refused with no code at all', 'false',
       verify_studio_code('stranger@test.invalid', '')::text,
       verify_studio_code('stranger@test.invalid', '') = false;

-- The hash is salted with the address, so a code lifted from one row cannot be
-- replayed against another.
insert into admin_emails (email) values ('other@test.invalid') on conflict do nothing;
do $$
declare same boolean;
begin
  perform set_studio_code('other@test.invalid', 'correct horse battery');
  select a.setup_code_hash = b.setup_code_hash into same
    from admin_emails a, admin_emails b
   where a.email = 'claim@test.invalid' and b.email = 'other@test.invalid';
  insert into results (test, expected, got, pass)
  values ('The same code on two addresses gives two different hashes', 'true',
          (not same)::text, not same);
end $$;

select mark_studio_claimed('claim@test.invalid');

insert into results (test, expected, got, pass)
select 'A claimed address cannot be claimed again', 'false',
       verify_studio_code('claim@test.invalid', 'correct horse battery')::text,
       verify_studio_code('claim@test.invalid', 'correct horse battery') = false;

-- Which is also how a lost password is recovered when there is no mail: set a
-- new code, and the row opens again.
select set_studio_code('claim@test.invalid', 'a completely new code');

insert into results (test, expected, got, pass)
select 'Setting a new code re-opens a claimed address', 'true',
       verify_studio_code('claim@test.invalid', 'a completely new code')::text,
       verify_studio_code('claim@test.invalid', 'a completely new code');

do $$
declare blocked boolean;
begin
  begin
    perform set_studio_code('nobody@test.invalid', 'a long enough code');
    blocked := false;
  exception when others then blocked := true;
  end;
  insert into results (test, expected, got, pass)
  values ('Setting a code refuses an address that is not listed', 'blocked',
          case when blocked then 'blocked' else 'GOT THROUGH' end, blocked);
end $$;

-- A code that could be typed by hand in an afternoon is not a second factor.
do $$
declare blocked boolean;
begin
  begin
    perform set_studio_code('claim@test.invalid', 'short');
    blocked := false;
  exception when others then blocked := true;
  end;
  insert into results (test, expected, got, pass)
  values ('A setup code under ten characters is refused', 'blocked',
          case when blocked then 'blocked' else 'GOT THROUGH' end, blocked);
end $$;

-- And none of it is reachable from a browser: the claim endpoint holds the
-- service key, so a client cannot sit and guess at the code.
set role authenticated;
select as_user(:ANN);
do $$
declare blocked boolean;
begin
  begin
    perform verify_studio_code('claim@test.invalid', 'a completely new code');
    blocked := false;
  exception when others then blocked := true;
  end;
  insert into results (test, expected, got, pass)
  values ('A signed-in client cannot ask whether a code is right', 'blocked',
          case when blocked then 'blocked' else 'GOT THROUGH' end, blocked);
end $$;

do $$
declare blocked boolean;
begin
  begin
    perform set_studio_code('claim@test.invalid', 'my own code thanks');
    blocked := false;
  exception when others then blocked := true;
  end;
  insert into results (test, expected, got, pass)
  values ('A signed-in client cannot set a setup code', 'blocked',
          case when blocked then 'blocked' else 'GOT THROUGH' end, blocked);
end $$;

do $$
declare blocked boolean;
begin
  begin
    perform studio_code_required('claim@test.invalid');
    blocked := false;
  exception when others then blocked := true;
  end;
  insert into results (test, expected, got, pass)
  values ('A signed-in client cannot ask whether an address needs a code',
          'blocked', case when blocked then 'blocked' else 'GOT THROUGH' end, blocked);
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
