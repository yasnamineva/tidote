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
