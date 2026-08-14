-- ============================================================
-- Ndarinzwe Health — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── Profiles (one per user, every role) ──────────────────────
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            text not null check (role in ('mother', 'chw')),
  full_name       text not null,
  phone           text,
  date_of_birth   date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── CHWs (must come before mothers for the FK) ───────────────
create table if not exists public.chws (
  id          uuid primary key references public.profiles(id) on delete cascade,
  chw_code    text unique not null,
  sector      text not null,
  district    text not null,
  lat         double precision,
  lng         double precision,
  created_at  timestamptz not null default now()
);

-- ── Mothers ──────────────────────────────────────────────────
create table if not exists public.mothers (
  id              uuid primary key references public.profiles(id) on delete cascade,
  lmp_date        date,
  due_date        date not null,
  district        text,
  sector          text,
  village         text,
  lat             double precision,
  lng             double precision,
  linked_chw_id   uuid references public.chws(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── ANC visits ────────────────────────────────────────────────
create table if not exists public.anc_visits (
  id              uuid primary key default gen_random_uuid(),
  mother_id       uuid not null references public.mothers(id) on delete cascade,
  visit_date      date not null,
  facility_name   text,
  visit_type      text check (visit_type in ('first','second','third','fourth','postnatal')),
  notes           text,
  created_at      timestamptz not null default now()
);

-- ── Reminders ────────────────────────────────────────────────
create table if not exists public.reminders (
  id              uuid primary key default gen_random_uuid(),
  mother_id       uuid not null references public.mothers(id) on delete cascade,
  type            text not null check (type in ('anc_visit','medication','postnatal','general')),
  title           text not null,
  body            text,
  scheduled_at    timestamptz not null,
  sent            boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ── Messages (CHW ↔ Mother) ───────────────────────────────────
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  from_id     uuid not null references public.profiles(id),
  to_id       uuid not null references public.profiles(id),
  body        text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────
alter table public.profiles  enable row level security;
alter table public.chws      enable row level security;
alter table public.mothers   enable row level security;
alter table public.anc_visits enable row level security;
alter table public.reminders enable row level security;
alter table public.messages  enable row level security;

-- profiles
create policy "view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

-- chws
create policy "chw view own"    on public.chws for select using (auth.uid() = id);
create policy "chw insert own"  on public.chws for insert with check (auth.uid() = id);
create policy "chw update own"  on public.chws for update using (auth.uid() = id);
-- mothers can view CHW list (to search / select)
create policy "mothers view chws" on public.chws for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'mother'));

-- mothers
create policy "mother view own"   on public.mothers for select using (auth.uid() = id);
create policy "mother insert own" on public.mothers for insert with check (auth.uid() = id);
create policy "mother update own" on public.mothers for update using (auth.uid() = id);
-- CHW can view their assigned mothers
create policy "chw views assigned mothers" on public.mothers for select
  using (exists (
    select 1 from public.chws where chws.id = auth.uid() and chws.id = mothers.linked_chw_id
  ));

-- anc_visits
create policy "mother manages anc" on public.anc_visits for all using (auth.uid() = mother_id);
create policy "chw views anc of assigned" on public.anc_visits for select
  using (exists (
    select 1 from public.mothers m
    join public.chws c on c.id = m.linked_chw_id
    where m.id = anc_visits.mother_id and c.id = auth.uid()
  ));

-- reminders
create policy "mother manages reminders" on public.reminders for all using (auth.uid() = mother_id);

-- messages
create policy "view own messages" on public.messages for select
  using (auth.uid() = from_id or auth.uid() = to_id);
create policy "send messages" on public.messages for insert
  with check (auth.uid() = from_id);

-- ── Schema additions (run after initial schema) ──────────────
alter table public.profiles add column if not exists sex text check (sex in ('Male','Female'));
alter table public.profiles add column if not exists preferences text[];
alter table public.chws    add column if not exists health_facility text;
alter table public.chws    add column if not exists years_experience integer;

-- ── Health logs (mother daily check-ins) ─────────────────────
create table if not exists public.health_logs (
  id           uuid primary key default gen_random_uuid(),
  mother_id    uuid not null references public.mothers(id) on delete cascade,
  logged_date  date not null default current_date,
  mood         text check (mood in ('great','good','okay','poor','bad')),
  symptoms     text[],
  nutrition    text check (nutrition in ('on_track','needs_improvement','poor')),
  notes        text,
  created_at   timestamptz not null default now(),
  unique(mother_id, logged_date)
);
alter table public.health_logs enable row level security;
create policy "mother manages health logs" on public.health_logs for all using (auth.uid() = mother_id);

-- ── CHW scheduled visits ──────────────────────────────────────
create table if not exists public.chw_visits (
  id          uuid primary key default gen_random_uuid(),
  chw_id      uuid not null references public.chws(id) on delete cascade,
  mother_id   uuid not null references public.mothers(id) on delete cascade,
  visit_date  date not null,
  visit_type  text check (visit_type in ('antenatal','postnatal','general','emergency')) not null,
  notes       text,
  status      text check (status in ('scheduled','completed','missed')) not null default 'scheduled',
  created_at  timestamptz not null default now()
);
alter table public.chw_visits enable row level security;
create policy "chw manages own visits"  on public.chw_visits for all  using (auth.uid() = chw_id);
create policy "mother views own visits" on public.chw_visits for select using (auth.uid() = mother_id);

-- ── CHW care reports ──────────────────────────────────────────
create table if not exists public.chw_reports (
  id                uuid primary key default gen_random_uuid(),
  chw_id            uuid not null references public.chws(id) on delete cascade,
  mother_id         uuid not null references public.mothers(id) on delete cascade,
  report_date       date not null default current_date,
  visit_type        text,
  observations      text,
  action_taken      text,
  follow_up_needed  boolean default false,
  follow_up_date    date,
  created_at        timestamptz not null default now()
);
alter table public.chw_reports enable row level security;
create policy "chw manages own reports"  on public.chw_reports for all  using (auth.uid() = chw_id);
create policy "mother views own reports" on public.chw_reports for select using (auth.uid() = mother_id);

-- Allow CHW to create/view reminders for their assigned mothers
create policy "chw creates reminders for mothers" on public.reminders for insert
  with check (exists (
    select 1 from public.mothers m join public.chws c on c.id = m.linked_chw_id
    where m.id = reminders.mother_id and c.id = auth.uid()
  ));
create policy "chw views reminders for mothers" on public.reminders for select
  using (exists (
    select 1 from public.mothers m join public.chws c on c.id = m.linked_chw_id
    where m.id = reminders.mother_id and c.id = auth.uid()
  ));

-- ── Nearby CHW search function ────────────────────────────────
-- Uses simple Haversine approximation (accurate enough for Rwanda)
create or replace function public.find_nearby_chws(
  user_lat   double precision,
  user_lng   double precision,
  radius_km  double precision default 10
)
returns table (
  id           uuid,
  full_name    text,
  chw_code     text,
  sector       text,
  district     text,
  lat          double precision,
  lng          double precision,
  distance_km  double precision
)
language sql
security definer
set search_path = public
as $$
  select
    c.id,
    p.full_name,
    c.chw_code,
    c.sector,
    c.district,
    c.lat,
    c.lng,
    round(cast(
      111.32 * sqrt(
        power(c.lat - user_lat, 2) +
        power((c.lng - user_lng) * cos(radians(user_lat)), 2)
      ) as numeric
    ), 2) as distance_km
  from public.chws c
  join public.profiles p on p.id = c.id
  where c.lat is not null and c.lng is not null
    and 111.32 * sqrt(
          power(c.lat - user_lat, 2) +
          power((c.lng - user_lng) * cos(radians(user_lat)), 2)
        ) <= radius_km
  order by distance_km;
$$;
