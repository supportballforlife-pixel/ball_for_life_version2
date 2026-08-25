create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_number text not null unique,
  items jsonb not null,
  subtotal_gbp numeric(10, 2) not null,
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
  created_at timestamptz not null default now()
);

create table if not exists public.admin_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.admin_emails enable row level security;

alter table public.orders add column if not exists payment_status text not null default 'pending_payment';
alter table public.orders add column if not exists payment_url text;
alter table public.orders add column if not exists payment_reference text;
alter table public.orders add column if not exists paid_at timestamptz;
alter table public.orders add column if not exists shipping_name text;
alter table public.orders add column if not exists shipping_email text;
alter table public.orders add column if not exists shipping_phone text;
alter table public.orders add column if not exists shipping_address text;
alter table public.orders add column if not exists shipping_city text;
alter table public.orders add column if not exists shipping_postcode text;
alter table public.orders add column if not exists shipping_country text;

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
