create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_number text not null unique,
  items jsonb not null,
  subtotal_gbp numeric(10, 2) not null,
  shipping_gbp numeric(10, 2) not null default 0,
  discount_gbp numeric(10, 2) not null default 0,
  total_gbp numeric(10, 2) not null default 0,
  status text not null default 'processing',
  tracking_status text not null default 'Order received',
  tracking_number text,
  payment_status text not null default 'pending_payment',
  payment_url text,
  payment_reference text,
  paid_at timestamptz,
  shipping_name text,
  shipping_email text,
  shipping_phone text,
  shipping_address text,
  shipping_city text,
  shipping_postcode text,
  shipping_country text,
  reward_code text,
  reward_code_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.reward_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null unique,
  discount_percent integer not null default 10,
  earned_from_spend numeric(10, 2) not null default 150,
  used_order_id uuid references public.orders(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.site_visitors (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  page_path text,
  page_title text,
  referrer text,
  user_agent text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.reward_codes enable row level security;
alter table public.admin_emails enable row level security;
alter table public.site_visitors enable row level security;

alter table public.orders alter column user_id drop not null;
alter table public.orders add column if not exists payment_status text not null default 'pending_payment';
alter table public.orders add column if not exists payment_url text;
alter table public.orders add column if not exists payment_reference text;
alter table public.orders add column if not exists paid_at timestamptz;
alter table public.orders add column if not exists shipping_gbp numeric(10, 2) not null default 0;
alter table public.orders add column if not exists discount_gbp numeric(10, 2) not null default 0;
alter table public.orders add column if not exists total_gbp numeric(10, 2) not null default 0;
alter table public.orders add column if not exists shipping_name text;
alter table public.orders add column if not exists shipping_email text;
alter table public.orders add column if not exists shipping_phone text;
alter table public.orders add column if not exists shipping_address text;
alter table public.orders add column if not exists shipping_city text;
alter table public.orders add column if not exists shipping_postcode text;
alter table public.orders add column if not exists shipping_country text;
alter table public.orders add column if not exists reward_code text;
alter table public.orders add column if not exists reward_code_id uuid references public.reward_codes(id) on delete set null;

alter table public.reward_codes add column if not exists discount_percent integer not null default 10;
alter table public.reward_codes add column if not exists earned_from_spend numeric(10, 2) not null default 150;
alter table public.reward_codes add column if not exists used_order_id uuid references public.orders(id) on delete set null;
alter table public.reward_codes add column if not exists used_at timestamptz;

create index if not exists reward_codes_user_id_idx on public.reward_codes(user_id);
create index if not exists reward_codes_code_idx on public.reward_codes(lower(code));
create index if not exists site_visitors_session_id_idx on public.site_visitors(session_id);
create index if not exists site_visitors_last_seen_idx on public.site_visitors(last_seen_at desc);
create index if not exists site_visitors_first_seen_idx on public.site_visitors(first_seen_at desc);

-- After running this file, replace the email below with your login email and run it once:
-- insert into public.admin_emails (email) values ('you@example.com') on conflict (email) do nothing;

drop policy if exists "Admins can read their own admin email" on public.admin_emails;
create policy "Admins can read their own admin email"
on public.admin_emails
for select
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "Users can read their own orders" on public.orders;
create policy "Users can read their own orders"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own orders" on public.orders;
create policy "Users can create their own orders"
on public.orders
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can read their own reward codes" on public.reward_codes;
create policy "Users can read their own reward codes"
on public.reward_codes
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Admins can read all orders" on public.orders;
create policy "Admins can read all orders"
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_emails
    where lower(admin_emails.email) = lower(auth.jwt() ->> 'email')
  )
);

drop policy if exists "Admins can update order tracking" on public.orders;
create policy "Admins can update order tracking"
on public.orders
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_emails
    where lower(admin_emails.email) = lower(auth.jwt() ->> 'email')
  )
)
with check (
  exists (
    select 1
    from public.admin_emails
    where lower(admin_emails.email) = lower(auth.jwt() ->> 'email')
  )
);

drop policy if exists "Admins can read all reward codes" on public.reward_codes;
create policy "Admins can read all reward codes"
on public.reward_codes
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_emails
    where lower(admin_emails.email) = lower(auth.jwt() ->> 'email')
  )
);

drop policy if exists "Visitors can create analytics rows" on public.site_visitors;
create policy "Visitors can create analytics rows"
on public.site_visitors
for insert
to anon, authenticated
with check (true);

drop policy if exists "Visitors can update analytics rows" on public.site_visitors;
create policy "Visitors can update analytics rows"
on public.site_visitors
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Admins can read visitor analytics" on public.site_visitors;
create policy "Admins can read visitor analytics"
on public.site_visitors
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_emails
    where lower(admin_emails.email) = lower(auth.jwt() ->> 'email')
  )
);
