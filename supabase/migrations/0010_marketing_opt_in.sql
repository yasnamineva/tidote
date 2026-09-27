-- Whether they want the atelier's occasional email.
--
-- Kept on the profile rather than in a list somewhere else, because the only
-- honest answer to "who is subscribed" is "these people, and here is when each
-- of them said so". A separate list drifts from the accounts it describes, and
-- the first thing that goes wrong is someone unsubscribing and still receiving.
--
-- Two things it is not. It is not consent for anything about their own orders:
-- a message about a fitting or a price is the service they asked for, not
-- marketing, and it is sent whatever this says. And it is not on by default —
-- nobody is subscribed by failing to notice a ticked box.

alter table profiles
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists marketing_opt_in_at timestamptz,
  -- Which language to write to them in. The notification's own sentence is
  -- composed in whatever language the person who caused it was using, which is
  -- the studio's more often than not — so an email built from that would reach
  -- an English client in Bulgarian.
  add column if not exists lang text not null default 'bg';

-- What an alert is about, so an email can be written from it rather than from
-- its sentence: the piece, the stage it moved to, the price, who it concerns.
alter table notifications
  add column if not exists data jsonb not null default '{}'::jsonb;

-- The stamp is the record of when they said yes, which is the part that
-- matters if anyone is ever asked to show it.
create or replace function stamp_marketing_opt_in() returns trigger
language plpgsql as $$
begin
  if new.marketing_opt_in is distinct from old.marketing_opt_in then
    new.marketing_opt_in_at := case when new.marketing_opt_in then now() else null end;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_stamp_marketing on profiles;
create trigger profiles_stamp_marketing
  before update on profiles
  for each row execute function stamp_marketing_opt_in();

-- Asked on the registration form, where there is no session yet to write a
-- profile row with — so it arrives in the user's metadata and the signup
-- trigger reads it across. Everything else about that trigger is unchanged.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, role, name, email, marketing_opt_in, marketing_opt_in_at, lang)
  values (
    new.id,
    case
      when new.email_confirmed_at is not null
       and exists (select 1 from admin_emails where email = new.email)
      then 'admin'::user_role
      else 'client'::user_role
    end,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    coalesce((new.raw_user_meta_data ->> 'marketing_opt_in')::boolean, false),
    case
      when coalesce((new.raw_user_meta_data ->> 'marketing_opt_in')::boolean, false)
      then now()
    end,
    case when new.raw_user_meta_data ->> 'lang' = 'en' then 'en' else 'bg' end
  );

  insert into measurements (profile_id) values (new.id);
  insert into delivery_info (profile_id) values (new.id);

  return new;
end;
$$;

comment on column profiles.marketing_opt_in is
  'Consent for the atelier''s occasional email. Not needed for anything about '
  'their own orders, which is service rather than marketing.';
