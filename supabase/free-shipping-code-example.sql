alter table public.limited_discount_codes
add column if not exists free_shipping boolean not null default false;

insert into public.limited_discount_codes (
  code,
  discount_percent,
  min_item_quantity,
  max_uses,
  free_shipping,
  active,
  notes
)
values (
  'FREESHIP',
  0,
  1,
  100,
  true,
  true,
  'Free shipping code'
)
on conflict (code) do update
set
  discount_percent = excluded.discount_percent,
  min_item_quantity = excluded.min_item_quantity,
  max_uses = excluded.max_uses,
  free_shipping = excluded.free_shipping,
  active = excluded.active,
  notes = excluded.notes;
