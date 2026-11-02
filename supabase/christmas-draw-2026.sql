-- Run once in the Supabase SQL Editor before publishing the Christmas Draw.
-- Stores one free entry per email and three bonus entries per eligible paid order.

create table if not exists public.christmas_draw_entries (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  marketing_opted_in boolean not null default false,
  terms_accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.christmas_draw_purchase_entries (
  order_id uuid primary key references public.orders(id) on delete cascade,
  email text not null,
  entry_count smallint not null default 3 check (entry_count = 3),
  created_at timestamptz not null default now()
);

alter table public.christmas_draw_entries enable row level security;
alter table public.christmas_draw_purchase_entries enable row level security;

-- The Edge Functions use the service role. No browser policies are created.

create or replace function public.add_christmas_draw_purchase_entries(p_order_id uuid, p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if now() > timestamptz '2026-12-24 23:59:59+00' then return false; end if;
  if not exists (select 1 from public.christmas_draw_entries where email = lower(trim(p_email))) then return false; end if;
  insert into public.christmas_draw_purchase_entries (order_id, email)
  values (p_order_id, lower(trim(p_email)))
  on conflict (order_id) do nothing;
  return found;
end;
$$;

-- Run this after the draw has closed to select three distinct, weighted winners.
-- Each entry email has one chance; each qualifying paid order adds three chances.
create or replace function public.pick_christmas_draw_winners()
returns table (email text, total_entries integer)
language sql
security definer
set search_path = public
as $$
  with entry_totals as (
    select e.email, 1 + coalesce(sum(p.entry_count), 0)::integer as total_entries
    from public.christmas_draw_entries e
    left join public.christmas_draw_purchase_entries p on p.email = e.email
    group by e.email
  ), weighted as (
    select entry_totals.email, entry_totals.total_entries, random() as pick
    from entry_totals
    cross join lateral generate_series(1, entry_totals.total_entries)
  ), distinct_entries as (
    select distinct on (email) email, total_entries, pick
    from weighted
    order by email, pick
  )
  select email, total_entries from distinct_entries order by pick limit 3;
$$;

revoke all on function public.add_christmas_draw_purchase_entries(uuid, text) from public;
revoke all on function public.pick_christmas_draw_winners() from public;
