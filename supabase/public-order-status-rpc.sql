create or replace function public.get_public_order_status(lookup_order_number text)
returns table (
  order_number text,
  subtotal_gbp numeric,
  shipping_gbp numeric,
  discount_gbp numeric,
  total_gbp numeric,
  status text,
  tracking_status text,
  tracking_number text,
  payment_status text,
  payment_url text,
  payment_reference text,
  reward_code text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    o.order_number,
    o.subtotal_gbp,
    o.shipping_gbp,
    o.discount_gbp,
    o.total_gbp,
    o.status,
    o.tracking_status,
    o.tracking_number,
    o.payment_status,
    o.payment_url,
    o.payment_reference,
    o.reward_code,
    o.created_at
  from public.orders o
  where upper(o.order_number) = upper(trim(lookup_order_number))
  limit 1;
$$;

revoke all on function public.get_public_order_status(text) from public;
grant execute on function public.get_public_order_status(text) to anon, authenticated;
