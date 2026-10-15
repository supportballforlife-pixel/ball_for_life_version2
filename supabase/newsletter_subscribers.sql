-- Ball For Life: newsletter table + admin read access.
-- Run the entire file in Supabase SQL Editor. Safe to rerun; existing rows are retained.
-- Requires the existing public.admin_emails allowlist. Signups remain server-side only.
begin;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_source text not null default 'unknown',
  last_source text not null default 'unknown',
  subscribed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_subscribed boolean not null default true,
  constraint newsletter_subscribers_email_lowercase check (email = lower(email))
);

-- Support the old source/created_at/subscribed schema without resetting consent or dates.
alter table public.newsletter_subscribers add column if not exists first_source text;
alter table public.newsletter_subscribers add column if not exists last_source text;
alter table public.newsletter_subscribers add column if not exists subscribed_at timestamptz;
alter table public.newsletter_subscribers add column if not exists updated_at timestamptz;
alter table public.newsletter_subscribers add column if not exists is_subscribed boolean;

do $$
begin
  if exists(select 1 from information_schema.columns where table_schema='public' and table_name='newsletter_subscribers' and column_name='source') then
    execute 'update public.newsletter_subscribers set first_source=coalesce(first_source, nullif(source, ''''), ''unknown''), last_source=coalesce(last_source, nullif(source, ''''), ''unknown'')';
  end if;
  if exists(select 1 from information_schema.columns where table_schema='public' and table_name='newsletter_subscribers' and column_name='created_at') then
    execute 'update public.newsletter_subscribers set subscribed_at=coalesce(subscribed_at, created_at, updated_at, now())';
  end if;
  if exists(select 1 from information_schema.columns where table_schema='public' and table_name='newsletter_subscribers' and column_name='subscribed') then
    execute 'update public.newsletter_subscribers set is_subscribed=coalesce(is_subscribed, subscribed, true)';
  end if;
end $$;

update public.newsletter_subscribers set
  first_source=coalesce(first_source, 'unknown'),
  last_source=coalesce(last_source, first_source, 'unknown'),
  subscribed_at=coalesce(subscribed_at, updated_at, now()),
  updated_at=coalesce(updated_at, subscribed_at, now()),
  is_subscribed=coalesce(is_subscribed, true);

alter table public.newsletter_subscribers alter column first_source set default 'unknown';
alter table public.newsletter_subscribers alter column first_source set not null;
alter table public.newsletter_subscribers alter column last_source set default 'unknown';
alter table public.newsletter_subscribers alter column last_source set not null;
alter table public.newsletter_subscribers alter column subscribed_at set default now();
alter table public.newsletter_subscribers alter column subscribed_at set not null;
alter table public.newsletter_subscribers alter column updated_at set default now();
alter table public.newsletter_subscribers alter column updated_at set not null;
alter table public.newsletter_subscribers alter column is_subscribed set default true;
alter table public.newsletter_subscribers alter column is_subscribed set not null;

create unique index if not exists newsletter_subscribers_email_unique
  on public.newsletter_subscribers (email);

create index if not exists newsletter_subscribers_subscribed_at_idx
  on public.newsletter_subscribers (subscribed_at desc);

alter table public.newsletter_subscribers enable row level security;
revoke all on public.newsletter_subscribers from public, anon, authenticated;
grant select on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;
drop policy if exists "Visitors can subscribe to newsletter" on public.newsletter_subscribers;
drop policy if exists "Visitors can update newsletter subscription" on public.newsletter_subscribers;
drop policy if exists "Admins can read newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins can read newsletter subscribers" on public.newsletter_subscribers
for select to authenticated using (
  exists(select 1 from public.admin_emails where lower(email)=lower(auth.jwt()->>'email'))
);
-- Keep the admin requirement even if a legacy permissive SELECT policy still exists.
drop policy if exists "Newsletter reads require admin" on public.newsletter_subscribers;
create policy "Newsletter reads require admin" on public.newsletter_subscribers
as restrictive for select to authenticated using (
  exists(select 1 from public.admin_emails where lower(email)=lower(auth.jwt()->>'email'))
);
commit;
