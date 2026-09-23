-- Categorías, subcategorías y marcas para el inventario.
-- Es aditiva: NO borra products.category ni products.brand, así el sitio actual sigue
-- funcionando hasta que el frontend use las columnas nuevas. Luego se pueden eliminar.
-- Aplicada en Supabase el 2026-09-23 (el SQL Editor y apply_migration la corren en una transacción).

-- ─────────────────────────────────────────────────────────────
-- 1. Categorías (nivel principal)
--    `kind` agrupa las categorías que comparten subcategorías: las 4 de monturas
--    usan las mismas (TR, acetato, …).
-- ─────────────────────────────────────────────────────────────
create table public.categories (
  id          smallserial primary key,
  slug        text not null unique,
  name        text not null,
  kind        text not null check (kind in ('montura', 'liquido', 'contacto', 'accesorio')),
  sort_order  smallint not null default 0,
  active      boolean not null default true
);

insert into public.categories (slug, name, kind, sort_order) values
  ('monturas-hombre',  'Monturas hombre',                  'montura',   1),
  ('monturas-mujer',   'Monturas mujer',                   'montura',   2),
  ('monturas-ninos',   'Monturas niños',                   'montura',   3),
  ('monturas-sol',     'Monturas de sol',                  'montura',   4),
  ('lentes-contacto',  'Lentes de contacto',               'contacto',  5),
  ('liquidos',         'Líquidos y gotas lubricantes',     'liquido',   6),
  ('accesorios',       'Accesorios',                       'accesorio', 7);

-- ─────────────────────────────────────────────────────────────
-- 2. Subcategorías, compartidas por todas las categorías del mismo `kind`
-- ─────────────────────────────────────────────────────────────
create table public.subcategories (
  id          smallserial primary key,
  kind        text not null check (kind in ('montura', 'liquido', 'contacto', 'accesorio')),
  slug        text not null,
  name        text not null,
  sort_order  smallint not null default 0,
  active      boolean not null default true,
  unique (kind, slug)
);

insert into public.subcategories (kind, slug, name, sort_order) values
  ('montura',   'tr',          'TR',        1),
  ('montura',   'acetato',     'Acetato',   2),
  ('montura',   'ranura',      'Ranura',    3),
  ('montura',   'tres-piezas', '3 piezas',  4),
  ('montura',   'aluminio',    'Aluminio',  5),
  ('montura',   'miratex',     'Miratex',   6),
  ('montura',   'deportivo',   'Deportivo', 7),
  ('accesorio', 'cadenas',     'Cadenas',   1),
  ('accesorio', 'panos',       'Paños',     2),
  ('accesorio', 'estuches',    'Estuches',  3),
  -- Sugeridas: ajustar o borrar según el inventario real
  ('liquido',   'soluciones',        'Soluciones multipropósito', 1),
  ('liquido',   'gotas-lubricantes', 'Gotas lubricantes',         2);

-- ─────────────────────────────────────────────────────────────
-- 3. Marcas. `linea_de_marca = true` para marcas de diseñador (Gucci, Chanel…):
--    la sección "Línea de marca" muestra los productos de esas marcas.
-- ─────────────────────────────────────────────────────────────
create table public.brands (
  id              serial primary key,
  slug            text not null unique,
  name            text not null,
  linea_de_marca  boolean not null default false,
  logo_url        text,
  active          boolean not null default true
);

-- Crea una marca por cada texto distinto en products.brand. Las variantes que solo
-- cambian en mayúsculas o signos ("Ray-Ban", "RayBan", "rayban") se unen en una sola,
-- prefiriendo la que tiene mayúsculas y guion.
insert into public.brands (slug, name)
select distinct on (k)
  trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g')),
  name
from (
  select
    trim(brand) as name,
    regexp_replace(lower(brand), '[^a-z0-9]', '', 'g') as k
  from public.products
  where coalesce(trim(brand), '') <> ''
) b
order by k, (name ~ '[A-Z]') desc, (name like '%-%') desc, name;

-- ─────────────────────────────────────────────────────────────
-- 4. Nuevas columnas en products
-- ─────────────────────────────────────────────────────────────
alter table public.products
  add column category_id    smallint references public.categories (id),
  add column subcategory_id smallint references public.subcategories (id),
  add column brand_id       integer  references public.brands (id);

create index products_category_id_idx    on public.products (category_id);
create index products_subcategory_id_idx on public.products (subcategory_id);
create index products_brand_id_idx       on public.products (brand_id);

-- La subcategoría debe corresponder al tipo de la categoría (p. ej. no "Estuches" en una montura)
create or replace function public.check_product_subcategory()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.subcategory_id is not null then
    if new.category_id is null or (select kind from public.categories where id = new.category_id)
         <> (select kind from public.subcategories where id = new.subcategory_id) then
      raise exception 'La subcategoría no corresponde a la categoría del producto';
    end if;
  end if;
  return new;
end $$;

create trigger products_check_subcategory
  before insert or update of category_id, subcategory_id on public.products
  for each row execute function public.check_product_subcategory();

-- ─────────────────────────────────────────────────────────────
-- 5. Pasar los datos actuales al nuevo esquema
--    'lectura' y 'deportiva' no dicen si son de hombre o de mujer: quedan sin
--    categoría para revisarlas a mano en el admin.
-- ─────────────────────────────────────────────────────────────
update public.products p set brand_id = b.id
from public.brands b
where regexp_replace(lower(b.name), '[^a-z0-9]', '', 'g')
    = regexp_replace(lower(p.brand), '[^a-z0-9]', '', 'g');

update public.products set category_id = (select id from public.categories where slug = 'monturas-sol')
where category = 'sol';

update public.products set category_id = (select id from public.categories where slug = 'lentes-contacto')
where category = 'contacto';

update public.products set category_id = (select id from public.categories where slug = 'monturas-ninos')
where category = 'infantil';

-- ─────────────────────────────────────────────────────────────
-- 6. Seguridad (RLS): todos pueden leer, solo los admin pueden modificar
-- ─────────────────────────────────────────────────────────────
alter table public.categories    enable row level security;
alter table public.subcategories enable row level security;
alter table public.brands        enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create policy "Lectura pública" on public.categories    for select using (true);
create policy "Lectura pública" on public.subcategories for select using (true);
create policy "Lectura pública" on public.brands        for select using (true);

create policy "Admin gestiona" on public.categories    for all using (public.is_admin()) with check (public.is_admin());
create policy "Admin gestiona" on public.subcategories for all using (public.is_admin()) with check (public.is_admin());
create policy "Admin gestiona" on public.brands        for all using (public.is_admin()) with check (public.is_admin());


-- Para revisar qué productos quedaron sin categoría:
-- select id, name, brand, category from public.products where category_id is null and active;
