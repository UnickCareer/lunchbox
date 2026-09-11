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
  if p_date_key !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    raise exception 'Invalid date key';
  end if;

  if p_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
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
  if p_date_key !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
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
