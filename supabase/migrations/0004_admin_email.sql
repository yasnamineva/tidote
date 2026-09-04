-- Who the studio is.
--
-- The signup trigger reads this table, so the owner becomes an admin by signing
-- up through the normal login page — no one has to hand-edit a role afterwards,
-- and there is no window where the first account is a client.
--
-- Every address listed here becomes studio staff on signup. Add one later if
-- someone else needs access; the account has to be created *after* its row
-- exists, so add the row first, then sign up.
insert into admin_emails (email) values
  ('support@tidoteatelier.com'),
  -- Was already here when the address changed. Delete this line if it should
  -- not have studio access.
  ('marinova.tedi@gmail.com')
on conflict (email) do nothing;
