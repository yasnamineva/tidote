-- Who the studio is.
--
-- The signup trigger reads this table, so the owner becomes an admin by signing
-- up through the normal login page — no one has to hand-edit a role afterwards,
-- and there is no window where the first account is a client.
--
-- CHANGE THIS to the address the studio will sign in with before running the
-- migration. Adding a row later works too; the account has to be created after
-- the row exists.
insert into admin_emails (email) values ('yasna.mnv@gmail.com')
on conflict (email) do nothing;
