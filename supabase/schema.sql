-- =============================================================================
-- Hogwarts House Cup — database schema for Supabase
--
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- It is safe to run again (everything is "if not exists" / "or replace").
--
-- What it sets up
--   point_records   every award or deduction shown on the site
--   cup_settings    one row: when the cup ends (the countdown on the main page)
--   admins          which Supabase Auth users may change anything
--
-- Who can do what (row level security)
--   everyone (even signed out)  read records and the end time
--   admins only                 add / edit / delete records, change the end time
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.point_records (
  id              text primary key default ('rec-' || gen_random_uuid()::text),
  house_id        text not null check (house_id in ('gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff')),
  character_name  text not null check (char_length(character_name) between 1 and 60),
  character_grade smallint not null check (character_grade between 1 and 7),
  activity        text not null check (char_length(activity) between 1 and 500),
  points          integer not null check (points <> 0 and points between -1000 and 1000),
  category        text not null check (category in ('class', 'quidditch', 'duel', 'event', 'exploration', 'exemplary', 'violation', 'other')),
  awarded_by      text not null check (char_length(awarded_by) between 1 and 60),
  notes           text check (notes is null or char_length(notes) <= 300),
  created_at      timestamptz not null default now()
);

create index if not exists point_records_created_at_idx on public.point_records (created_at desc);
create index if not exists point_records_house_idx on public.point_records (house_id);

create table if not exists public.cup_settings (
  id         smallint primary key default 1 check (id = 1),   -- exactly one row
  ends_at    timestamptz not null default '2026-12-03T00:00:00+09:00',
  updated_at timestamptz not null default now()
);

insert into public.cup_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.admins (
  user_id  uuid primary key references auth.users (id) on delete cascade,
  label    text,                      -- e.g. a nickname, for your own reference
  added_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Is the signed-in user an admin?
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.point_records enable row level security;
alter table public.cup_settings  enable row level security;
alter table public.admins        enable row level security;

drop policy if exists "records are public" on public.point_records;
create policy "records are public" on public.point_records
  for select to anon, authenticated using (true);

drop policy if exists "admins add records" on public.point_records;
create policy "admins add records" on public.point_records
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admins edit records" on public.point_records;
create policy "admins edit records" on public.point_records
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete records" on public.point_records;
create policy "admins delete records" on public.point_records
  for delete to authenticated using (public.is_admin());

drop policy if exists "end time is public" on public.cup_settings;
create policy "end time is public" on public.cup_settings
  for select to anon, authenticated using (true);

drop policy if exists "admins change end time" on public.cup_settings;
create policy "admins change end time" on public.cup_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- admins can see the admin list; nobody can change it from the site
-- (add or remove admins here in the SQL editor, see the bottom of this file)
drop policy if exists "admins see admins" on public.admins;
create policy "admins see admins" on public.admins
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Replace every record at once (restore a backup / reset to the defaults).
-- Runs as the caller, so the admin-only policies above still apply, and in one
-- transaction, so a failed restore leaves the old records untouched.
-- ---------------------------------------------------------------------------

create or replace function public.replace_point_records(rows jsonb)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  inserted integer;
begin
  if not public.is_admin() then
    raise exception 'only admins can replace records' using errcode = '42501';
  end if;

  delete from public.point_records where true;

  insert into public.point_records
    (id, house_id, character_name, character_grade, activity, points, category, awarded_by, notes, created_at)
  select
    coalesce(r->>'id', 'rec-' || gen_random_uuid()::text),
    r->>'houseId',
    r->>'characterName',
    (r->>'characterGrade')::smallint,
    r->>'activity',
    (r->>'points')::integer,
    r->>'category',
    r->>'awardedBy',
    nullif(r->>'notes', ''),
    coalesce((r->>'timestamp')::timestamptz, now())
  from jsonb_array_elements(rows) as r;

  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

revoke all on function public.replace_point_records(jsonb) from public;
grant execute on function public.replace_point_records(jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime: open pages update as soon as an admin changes something
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and tablename = 'point_records') then
    alter publication supabase_realtime add table public.point_records;
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and tablename = 'cup_settings') then
    alter publication supabase_realtime add table public.cup_settings;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Making someone an admin
--
-- 1. Supabase dashboard → Authentication → Users → "Add user" → create the
--    account with an email and password (tick "Auto Confirm User").
-- 2. Run this, with that email:
--
--      insert into public.admins (user_id, label)
--      select id, '관리자' from auth.users where email = 'admin@example.com';
--
-- To remove an admin:
--      delete from public.admins
--      where user_id = (select id from auth.users where email = 'admin@example.com');
-- ---------------------------------------------------------------------------
