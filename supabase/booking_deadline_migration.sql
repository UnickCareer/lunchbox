-- LunchBox Panipat: configurable employee booking deadline
-- Run this in Supabase SQL Editor on an existing project.
-- Default behavior remains 11:30 AM when today's key is absent.

alter table public.office_app_state
  add column if not exists booking_deadlines jsonb not null default '{}'::jsonb;

update public.office_app_state
set booking_deadlines = coalesce(booking_deadlines, '{}'::jsonb)
where id = 1;
