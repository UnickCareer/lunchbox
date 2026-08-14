-- Requirement 2: shared office data store for Order Panipat
-- Run this once in Supabase SQL Editor.

create table if not exists public.office_app_state (
  id integer primary key,
  employees jsonb not null default '[]'::jsonb,
  menu jsonb not null default '{}'::jsonb,
  orders jsonb not null default '{}'::jsonb,
  surplus_claims jsonb not null default '{}'::jsonb,
  login_requests jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.office_app_state enable row level security;

-- This app currently uses its own name/PIN login instead of Supabase Auth.
-- Therefore the browser uses the anon/publishable role. These policies make
-- the shared prototype work across employee phones and admin laptops.
-- IMPORTANT: this is not strong security. Do NOT expose a service_role key.
drop policy if exists "office_app_state_select" on public.office_app_state;
drop policy if exists "office_app_state_insert" on public.office_app_state;
drop policy if exists "office_app_state_update" on public.office_app_state;

grant select, insert, update on public.office_app_state to anon;

create policy "office_app_state_select"
  on public.office_app_state
  for select
  to anon
  using (true);

create policy "office_app_state_insert"
  on public.office_app_state
  for insert
  to anon
  with check (id = 1);

create policy "office_app_state_update"
  on public.office_app_state
  for update
  to anon
  using (id = 1)
  with check (id = 1);

-- Realtime: the admin laptop can receive order changes made on phones.
alter publication supabase_realtime
  add table public.office_app_state;
