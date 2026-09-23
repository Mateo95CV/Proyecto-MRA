-- Forma de montura para conectar el visagismo con el catálogo.
-- Ejecutar en Supabase: SQL Editor → pegar → Run.

alter table public.products
  add column if not exists frame_shape text
  check (frame_shape in (
    'rectangular', 'cuadrada', 'redonda', 'ovalada',
    'cat-eye', 'aviador', 'mariposa', 'al-aire'
  ));

create index if not exists products_frame_shape_idx on public.products (frame_shape);
