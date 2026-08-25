-- BALL FOR LIFE — marketing email subscribers
-- Run once in Supabase Dashboard > SQL Editor.

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

create unique index if not exists newsletter_subscribers_email_unique
  on public.newsletter_subscribers (email);

create index if not exists newsletter_subscribers_subscribed_at_idx
  on public.newsletter_subscribers (subscribed_at desc);

alter table public.newsletter_subscribers enable row level security;

-- No browser-facing INSERT/SELECT policy is created.
-- Signups go through the newsletter-signup Edge Function,
-- which uses the project's server-side secret key.
