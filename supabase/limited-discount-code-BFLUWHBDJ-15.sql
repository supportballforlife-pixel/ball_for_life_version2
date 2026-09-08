create table if not exists public.limited_discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent integer not null,
  min_item_quantity integer not null default 1,
  max_uses integer not null default 1,
  used_count integer not null default 0,
  active boolean not null default true,
  used_order_id uuid references public.orders(id) on delete set null,
  used_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.limited_discount_codes enable row level security;

create index if not exists limited_discount_codes_code_idx
on public.limited_discount_codes(lower(code));

insert into public.limited_discount_codes (code, discount_percent, min_item_quantity, max_uses, active, notes)
values ('BFLUWHBDJ-15', 15, 3, 1, true, 'One-use 15% off code for carts with more than 2 tees')
on conflict (code) do update
set
  discount_percent = excluded.discount_percent,
  min_item_quantity = excluded.min_item_quantity,
  max_uses = excluded.max_uses,
  active = excluded.active,
  notes = excluded.notes;
