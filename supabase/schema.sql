-- Requirement 2: shared office data store for Order Panipat
-- Run this once in Supabase SQL Editor.

create table if not exists public.office_app_state (
  id integer primary key,
  employees jsonb not null default '[]'::jsonb,
  menu jsonb not null default '{}'::jsonb,
  orders jsonb not null default '{}'::jsonb,
  surplus_claims jsonb not null default '{}'::jsonb,
  login_requests jsonb not null default '[]'::jsonb,
  booking_deadlines jsonb not null default '{}'::jsonb,
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


-- LunchBox Panipat: booking deadline RPCs
-- Run this once in Supabase SQL Editor after booking_deadlines exists.

create or replace function public.set_booking_deadline(
  p_date_key text,
  p_time text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deadlines jsonb;
begin
  if p_date_key !~ '^\\d{4}-\\d{2}-\\d{2}$' then
    raise exception 'Invalid date key';
  end if;

  if p_time !~ '^([01]\\d|2[0-3]):[0-5]\\d$' then
    raise exception 'Invalid booking deadline time';
  end if;

  update public.office_app_state
  set booking_deadlines =
        coalesce(booking_deadlines, '{}'::jsonb)
        || jsonb_build_object(p_date_key, p_time),
      updated_at = now()
  where id = 1
  returning booking_deadlines into v_deadlines;

  if v_deadlines is null then
    raise exception 'office_app_state row id=1 not found';
  end if;

  return v_deadlines;
end;
$$;

create or replace function public.reset_booking_deadline(
  p_date_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deadlines jsonb;
begin
  if p_date_key !~ '^\\d{4}-\\d{2}-\\d{2}$' then
    raise exception 'Invalid date key';
  end if;

  update public.office_app_state
  set booking_deadlines =
        coalesce(booking_deadlines, '{}'::jsonb) - p_date_key,
      updated_at = now()
  where id = 1
  returning booking_deadlines into v_deadlines;

  if v_deadlines is null then
    raise exception 'office_app_state row id=1 not found';
  end if;

  return v_deadlines;
end;
$$;

grant execute on function public.set_booking_deadline(text, text) to anon;
grant execute on function public.reset_booking_deadline(text) to anon;
