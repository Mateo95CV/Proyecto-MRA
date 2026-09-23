-- Los precios y el total de los pedidos se calculan en la base de datos, no en el navegador.
-- También valida y descuenta stock, y lo devuelve si el admin cancela el pedido.
-- Funciona con el código viejo (inserciones directas) y con el nuevo (rpc create_order).
-- Aplicada en Supabase el 2026-09-23.

-- Marca los pedidos que ya descontaron stock (los anteriores a esta migración no lo hicieron,
-- así que cancelarlos no debe sumar stock)
alter table public.orders add column if not exists stock_reserved boolean not null default false;

-- ─────────────────────────────────────────────────────────────
-- Pedido nuevo desde el sitio: total en 0 y estado Pendiente; los items lo recalculan
-- ─────────────────────────────────────────────────────────────
create or replace function public.orders_before_insert()
returns trigger language plpgsql set search_path = public as $$
begin
  if auth.role() in ('anon', 'authenticated') then
    new.total := 0;
    new.status := 'Pendiente';
    new.stock_reserved := false;
  end if;
  return new;
end $$;

drop trigger if exists orders_before_insert on public.orders;
create trigger orders_before_insert
  before insert on public.orders
  for each row execute function public.orders_before_insert();

-- ─────────────────────────────────────────────────────────────
-- Cada item toma precio y datos del producto, valida stock y lo descuenta
-- ─────────────────────────────────────────────────────────────
create or replace function public.order_items_before_insert()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  p public.products;
begin
  if new.product_id is null then
    raise exception 'Producto no válido';
  end if;
  if new.quantity is null or new.quantity < 1 or new.quantity > 20 then
    raise exception 'Cantidad no válida';
  end if;

  select * into p from public.products where id = new.product_id for update;
  if not found or not p.active then
    raise exception 'El producto ya no está disponible';
  end if;
  if p.stock < new.quantity then
    raise exception 'No hay suficiente stock de "%": quedan %', p.name, p.stock;
  end if;

  new.price     := p.price;
  new.name      := p.name;
  new.brand     := p.brand;
  new.image_url := p.image_url;

  update public.products set stock = stock - new.quantity where id = p.id;
  return new;
end $$;

drop trigger if exists order_items_before_insert on public.order_items;
create trigger order_items_before_insert
  before insert on public.order_items
  for each row execute function public.order_items_before_insert();

create or replace function public.order_items_after_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.orders
     set total = (select coalesce(sum(price * quantity), 0) from public.order_items where order_id = new.order_id),
         stock_reserved = true
   where id = new.order_id;
  return null;
end $$;

drop trigger if exists order_items_after_insert on public.order_items;
create trigger order_items_after_insert
  after insert on public.order_items
  for each row execute function public.order_items_after_insert();

-- Solo se pueden agregar items a un pedido propio, pendiente y recién creado
drop policy if exists "Items: agregar a pedido propio pendiente" on public.order_items;
create policy "Items: agregar a pedido propio pendiente" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o
            where o.id = order_id
              and o.user_id = auth.uid()
              and o.status = 'Pendiente'
              and o.created_at > now() - interval '15 minutes')
  );

-- ─────────────────────────────────────────────────────────────
-- Cancelar un pedido devuelve el stock; reactivarlo lo vuelve a descontar
-- ─────────────────────────────────────────────────────────────
create or replace function public.orders_restock_on_cancel()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  signo int;
begin
  if not new.stock_reserved or new.status is not distinct from old.status then
    return new;
  end if;

  if new.status = 'Cancelado' then
    signo := 1;
  elsif old.status = 'Cancelado' then
    signo := -1;
  else
    return new;
  end if;

  update public.products p
     set stock = p.stock + signo * i.cantidad
    from (select product_id, sum(quantity) as cantidad
            from public.order_items
           where order_id = new.id and product_id is not null
           group by product_id) i
   where p.id = i.product_id;

  return new;
exception
  when check_violation then
    raise exception 'No hay stock suficiente para reactivar este pedido';
end $$;

drop trigger if exists orders_restock_on_cancel on public.orders;
create trigger orders_restock_on_cancel
  after update of status on public.orders
  for each row execute function public.orders_restock_on_cancel();

-- ─────────────────────────────────────────────────────────────
-- create_order: crea el pedido y sus items en una sola transacción.
-- SECURITY INVOKER: corre con los permisos (RLS) del cliente que la llama.
-- ─────────────────────────────────────────────────────────────
create or replace function public.create_order(
  p_items            jsonb,
  p_shipping_name    text,
  p_shipping_address text,
  p_shipping_city    text,
  p_shipping_phone   text,
  p_payment_method   text
)
returns public.orders
language plpgsql security invoker set search_path = public as $$
declare
  v_order public.orders;
  v_item  jsonb;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión para hacer un pedido';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El carrito está vacío';
  end if;
  if p_payment_method not in ('tarjeta', 'transferencia', 'contraentrega') then
    raise exception 'Método de pago no válido';
  end if;
  if coalesce(trim(p_shipping_name), '') = '' or coalesce(trim(p_shipping_address), '') = ''
     or coalesce(trim(p_shipping_city), '') = '' or coalesce(trim(p_shipping_phone), '') = '' then
    raise exception 'Faltan datos de envío';
  end if;

  insert into public.orders (user_id, total, shipping_name, shipping_address, shipping_city, shipping_phone, payment_method)
  values (auth.uid(), 0, trim(p_shipping_name), trim(p_shipping_address), trim(p_shipping_city), trim(p_shipping_phone), p_payment_method)
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    -- name y price se sobrescriben en el trigger con los datos reales del producto
    insert into public.order_items (order_id, product_id, quantity, name, price)
    values (v_order.id, (v_item->>'product_id')::uuid, (v_item->>'quantity')::int, '', 0);
  end loop;

  select * into v_order from public.orders where id = v_order.id;
  return v_order;
end $$;

revoke execute on function public.create_order(jsonb, text, text, text, text, text) from public, anon;
grant  execute on function public.create_order(jsonb, text, text, text, text, text) to authenticated;

revoke execute on function public.orders_before_insert()      from public, anon, authenticated;
revoke execute on function public.order_items_before_insert() from public, anon, authenticated;
revoke execute on function public.order_items_after_insert()  from public, anon, authenticated;
revoke execute on function public.orders_restock_on_cancel()  from public, anon, authenticated;
