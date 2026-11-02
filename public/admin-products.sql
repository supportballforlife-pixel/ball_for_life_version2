-- Ball For Life product manager
-- Run once in Supabase SQL Editor. It creates the product table and the image bucket
-- used by admin.html. Only emails in public.admin_emails may change products.

begin;

create table if not exists public.store_products (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{1,95}$'),
  name text not null check (char_length(name) between 2 and 120),
  category text not null check (category in ('Graphic Tees', 'Tracksuits', 'Hoodies', 'Bottoms')),
  kind text not null default 'tee' check (kind in ('tee', 'hoodie', 'bottoms', 'set')),
  price_gbp numeric(10,2) not null check (price_gbp > 0),
  sizes text[] not null default array['S','M','L','XL'],
  summary text,
  description text,
  front_image text not null,
  back_image text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_store_product_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists store_products_updated_at on public.store_products;
create trigger store_products_updated_at before update on public.store_products
for each row execute function public.set_store_product_updated_at();

alter table public.store_products enable row level security;
grant select on public.store_products to anon, authenticated;
grant insert, update, delete on public.store_products to authenticated;
drop policy if exists "Anyone can view live store products" on public.store_products;
create policy "Anyone can view live store products" on public.store_products
for select using (active = true);
drop policy if exists "Admins manage store products" on public.store_products;
create policy "Admins manage store products" on public.store_products
for all to authenticated
using (exists (select 1 from public.admin_emails where lower(email) = lower(auth.jwt() ->> 'email')))
with check (exists (select 1 from public.admin_emails where lower(email) = lower(auth.jwt() ->> 'email')));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Anyone can view product images" on storage.objects;
create policy "Anyone can view product images" on storage.objects
for select using (bucket_id = 'product-images');
drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images" on storage.objects
for insert to authenticated with check (
  bucket_id = 'product-images' and exists (select 1 from public.admin_emails where lower(email) = lower(auth.jwt() ->> 'email'))
);
drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images" on storage.objects
for update to authenticated using (
  bucket_id = 'product-images' and exists (select 1 from public.admin_emails where lower(email) = lower(auth.jwt() ->> 'email'))
) with check (
  bucket_id = 'product-images' and exists (select 1 from public.admin_emails where lower(email) = lower(auth.jwt() ->> 'email'))
);
drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images" on storage.objects
for delete to authenticated using (
  bucket_id = 'product-images' and exists (select 1 from public.admin_emails where lower(email) = lower(auth.jwt() ->> 'email'))
);

commit;
