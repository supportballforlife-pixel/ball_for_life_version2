-- Run once in Supabase SQL Editor, after the store's base schema.
-- Safe to rerun. Does not alter orders, discount codes or newsletter subscribers.
begin;

create table if not exists public.store_analytics_sessions (
  session_id uuid primary key,
  visitor_id uuid not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  page text not null,
  device text not null check (device in ('mobile', 'tablet', 'desktop')),
  referrer text,
  consent_version text not null default '2026-10-14',
  last_batch_at timestamptz
);
create table if not exists public.store_analytics_events (
  id uuid primary key,
  session_id uuid not null references public.store_analytics_sessions(session_id) on delete cascade,
  visitor_id uuid not null,
  created_at timestamptz not null default now(),
  event_type text not null check (event_type in ('page_view','product_view','add_to_cart','remove_from_cart','checkout_start','payment_start','newsletter_signup')),
  page text not null,
  product_id text,
  quantity smallint not null default 1 check (quantity between 1 and 99)
);
create index if not exists store_analytics_sessions_seen on public.store_analytics_sessions(last_seen_at);
create index if not exists store_analytics_sessions_first on public.store_analytics_sessions(first_seen_at);
create index if not exists store_analytics_events_created on public.store_analytics_events(created_at);
create index if not exists store_analytics_events_session on public.store_analytics_events(session_id, created_at);
alter table public.store_analytics_sessions enable row level security;
alter table public.store_analytics_events enable row level security;
revoke all on public.store_analytics_sessions, public.store_analytics_events from public, anon, authenticated;

-- Turn off the old collector and its unrestricted write grants. Retain historical rows.
do $$
begin
  if to_regclass('public.site_visitors') is not null then
    revoke insert, update on public.site_visitors from public, anon, authenticated;
  end if;
  if to_regprocedure('public.record_site_visit(text,uuid,text,text,text,text,text)') is not null then
    revoke execute on function public.record_site_visit(text,uuid,text,text,text,text,text) from public, anon, authenticated;
  end if;
end $$;

create or replace function public.record_store_activity(
  p_session_id uuid, p_visitor_id uuid, p_consent boolean, p_page text,
  p_device text, p_referrer text default null, p_events jsonb default '[]'::jsonb
) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_session public.store_analytics_sessions%rowtype;
  v_event jsonb;
  v_id uuid;
  v_product text;
  v_quantity integer;
begin
  if p_consent is distinct from true then return; end if;
  if p_session_id is null or p_visitor_id is null
    or p_page is null or p_page not in ('/','/shop','/product','/checkout','/about-us','/contact','/faq','/shipping-returns','/size-guide','/privacy-policy','/terms-conditions','/reviews')
    or p_device is null or p_device not in ('mobile','tablet','desktop')
    or p_events is null or jsonb_typeof(p_events) <> 'array'
    or octet_length(p_events::text) > 10000 then
    raise exception 'Invalid activity payload' using errcode = '22023';
  end if;
  if jsonb_array_length(p_events) > 20 then raise exception 'Too many events' using errcode = '22023'; end if;
  if p_referrer is not null and (length(p_referrer) > 120 or p_referrer !~ '^[a-zA-Z0-9.-]+$') then p_referrer := null; end if;

  insert into public.store_analytics_sessions(session_id, visitor_id, page, device, referrer)
  values(p_session_id, p_visitor_id, p_page, p_device, nullif(p_referrer, ''))
  on conflict (session_id) do nothing;
  select * into v_session from public.store_analytics_sessions where session_id = p_session_id for update;
  if v_session.visitor_id <> p_visitor_id then raise exception 'Session mismatch' using errcode = '22023'; end if;
  -- Bound writes per session; client-supplied events are engagement signals, never proof of a sale.
  if v_session.last_batch_at > now() - interval '1 second' then return; end if;
  update public.store_analytics_sessions set last_seen_at = now(), page = p_page, last_batch_at = now()
  where session_id = p_session_id;
  if (select count(*) from public.store_analytics_events where session_id = p_session_id and created_at > now() - interval '1 minute') < 120 then
    for v_event in select value from jsonb_array_elements(p_events) loop
      if jsonb_typeof(v_event) <> 'object' or coalesce(v_event->>'type','') not in
        ('page_view','product_view','add_to_cart','remove_from_cart','checkout_start','payment_start','newsletter_signup') then continue; end if;
      begin v_id := (v_event->>'id')::uuid; exception when invalid_text_representation then continue; end;
      if v_id is null then continue; end if;
      v_product := v_event->>'product_id';
      if v_product is not null and v_product !~ '^[a-z0-9][a-z0-9-]{0,119}$' then v_product := null; end if;
      v_quantity := 1;
      if (v_event->>'quantity') ~ '^[0-9]{1,2}$' then v_quantity := greatest(1, least(99, (v_event->>'quantity')::integer)); end if;
      insert into public.store_analytics_events(id, session_id, visitor_id, event_type, page, product_id, quantity)
      values(v_id, p_session_id, p_visitor_id, v_event->>'type', p_page, v_product, v_quantity)
      on conflict (id) do nothing;
    end loop;
  end if;
  -- Indexed retention cleanup on incoming activity, including quiet stores without pg_cron.
  delete from public.store_analytics_events where created_at < now() - interval '90 days';
  delete from public.store_analytics_sessions where last_seen_at < now() - interval '90 days';
end $$;
revoke all on function public.record_store_activity(uuid,uuid,boolean,text,text,text,jsonb) from public;
grant execute on function public.record_store_activity(uuid,uuid,boolean,text,text,text,jsonb) to anon, authenticated;

create or replace function public.get_store_analytics(p_days integer default 1)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_start timestamptz;
  v_result jsonb;
begin
  if not exists(select 1 from public.admin_emails where lower(email) = lower(auth.jwt()->>'email')) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if p_days is null or p_days not in (1,7,30) then raise exception 'Invalid reporting period' using errcode = '22023'; end if;
  v_start := (date_trunc('day', now() at time zone 'Europe/London') - (p_days - 1) * interval '1 day') at time zone 'Europe/London';
  with events as (
    select * from public.store_analytics_events where created_at >= v_start
  ), browsers as (
    select distinct on (visitor_id) visitor_id, device, referrer
    from public.store_analytics_sessions where last_seen_at >= v_start order by visitor_id, first_seen_at
  ), paid as (
    select total_gbp from public.orders where payment_status = 'paid' and coalesce(paid_at,created_at) >= v_start
  )
  select jsonb_build_object(
    'period_start', v_start,
    'live', (select count(distinct visitor_id) from public.store_analytics_sessions where last_seen_at >= now() - interval '60 seconds'),
    'visitors', (select count(distinct visitor_id) from events),
    'page_views', (select count(*) from events where event_type = 'page_view'),
    'add_to_cart', (select count(*) from events where event_type = 'add_to_cart'),
    'checkouts', (select count(*) from events where event_type = 'checkout_start'),
    'payment_starts', (select count(*) from events where event_type = 'payment_start'),
    'signups', (select count(*) from events where event_type = 'newsletter_signup'),
    'paid_orders', (select count(*) from paid),
    'revenue_gbp', (select coalesce(sum(total_gbp),0) from paid),
    'pages', coalesce((select jsonb_agg(row_to_json(t)) from (select page as label, count(*) as count from events where event_type = 'page_view' group by page order by count(*) desc, page limit 8) t),'[]'::jsonb),
    'products', coalesce((select jsonb_agg(row_to_json(t)) from (select product_id as label, count(*) filter(where event_type = 'product_view') as count, count(*) filter(where event_type = 'add_to_cart') as adds from events where product_id is not null and event_type in ('product_view','add_to_cart') group by product_id order by count(*) filter(where event_type = 'product_view') desc, product_id limit 8) t),'[]'::jsonb),
    'sources', coalesce((select jsonb_agg(row_to_json(t)) from (select coalesce(referrer,'Direct / same site') as label, count(*) as count from browsers group by referrer order by count(*) desc limit 8) t),'[]'::jsonb),
    'devices', coalesce((select jsonb_agg(row_to_json(t)) from (select device as label, count(*) as count from browsers group by device order by count(*) desc) t),'[]'::jsonb),
    'recent', coalesce((select jsonb_agg(row_to_json(t)) from (select event_type, page, product_id, created_at from events order by created_at desc limit 12) t),'[]'::jsonb)
  ) into v_result;
  return v_result;
end $$;
revoke all on function public.get_store_analytics(integer) from public, anon;
grant execute on function public.get_store_analytics(integer) to authenticated;
commit;
