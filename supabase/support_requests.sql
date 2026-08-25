-- Ball For Life support request storage
-- Run this ONCE in Supabase Dashboard > SQL Editor.

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  order_number text,
  reason text not null,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'in_progress', 'resolved')),
  email_sent boolean not null default false,
  resend_email_id text
);

create index if not exists support_requests_created_at_idx
  on public.support_requests (created_at desc);

create index if not exists support_requests_email_idx
  on public.support_requests (lower(email));

alter table public.support_requests enable row level security;

-- IMPORTANT:
-- No public SELECT/INSERT/UPDATE policy is created.
-- The browser does NOT write to this table directly.
-- The Edge Function writes using the project's server-side secret key.
