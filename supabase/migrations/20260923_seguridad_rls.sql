-- Cierra el acceso abierto a perfiles, pedidos, productos e imágenes.
-- Antes: políticas "true" dejaban a cualquiera (con la clave pública del sitio) leer datos
-- personales, modificar pedidos y productos, y darse rol admin.
-- Aplicada en Supabase el 2026-09-23. Depende de public.is_admin() (migración de categorías).

-- ─────────────────────────────────────────────────────────────
-- profiles: cada quien ve y edita su perfil; el admin ve y edita todos.
-- Solo un admin puede cambiar `role` o `active`.
-- ─────────────────────────────────────────────────────────────
drop policy if exists "Acceso total a perfiles"                   on public.profiles;
drop policy if exists "Usuarios ven su propio perfil"             on public.profiles;
drop policy if exists "users can read own profile"                on public.profiles;
drop policy if exists "users can update own profile"              on public.profiles;
drop policy if exists "Usuarios editan su propio perfil"          on public.profiles;
drop policy if exists "Usuario puede actualizar su propio perfil" on public.profiles;

create policy "Perfil propio o admin: ver" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "Perfil propio o admin: editar" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create or replace function public.protect_profile_privileges()
returns trigger language plpgsql set search_path = public as $$
begin
  -- auth.role() es null en el SQL Editor / service_role: ahí se permite todo
  if auth.role() in ('anon', 'authenticated')
     and (new.role is distinct from old.role or new.active is distinct from old.active or new.id <> old.id)
     and not public.is_admin() then
    raise exception 'Solo un administrador puede cambiar el rol o el estado de un usuario';
  end if;
  return new;
end $$;

drop trigger if exists profiles_protect_privileges on public.profiles;
create trigger profiles_protect_privileges
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();

-- ─────────────────────────────────────────────────────────────
-- orders: el cliente crea y ve sus pedidos; el admin ve y actualiza todos.
-- ─────────────────────────────────────────────────────────────
drop policy if exists "Acceso total a pedidos"     on public.orders;
drop policy if exists "Usuarios crean sus pedidos" on public.orders;
drop policy if exists "Usuarios ven sus pedidos"   on public.orders;

create policy "Pedidos: ver propios o admin" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

create policy "Pedidos: el cliente crea los suyos" on public.orders
  for insert with check (user_id = auth.uid() and status = 'Pendiente');

create policy "Pedidos: admin actualiza" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- order_items: se ven con su pedido; solo se agregan a un pedido propio pendiente.
-- ─────────────────────────────────────────────────────────────
drop policy if exists "Acceso total a order_items" on public.order_items;

create policy "Items: ver los del pedido propio o admin" on public.order_items
  for select using (
    exists (select 1 from public.orders o
            where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );

create policy "Items: agregar a pedido propio pendiente" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o
            where o.id = order_id and o.user_id = auth.uid() and o.status = 'Pendiente')
  );

-- ─────────────────────────────────────────────────────────────
-- products: lectura pública (se conserva "Productos visibles para todos");
-- crear, editar y borrar solo admin.
-- ─────────────────────────────────────────────────────────────
drop policy if exists "allow all for now"   on public.products;
drop policy if exists "Permitir insertar"   on public.products;
drop policy if exists "Permitir actualizar" on public.products;
drop policy if exists "Permitir eliminar"   on public.products;

create policy "Productos: admin crea"    on public.products for insert with check (public.is_admin());
create policy "Productos: admin edita"   on public.products for update using (public.is_admin()) with check (public.is_admin());
create policy "Productos: admin elimina" on public.products for delete using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- Storage: subir y borrar imágenes de productos solo admin (antes: cualquier registrado).
-- ─────────────────────────────────────────────────────────────
drop policy if exists "Solo autenticados suben imágenes"    on storage.objects;
drop policy if exists "Solo autenticados eliminan imágenes" on storage.objects;

create policy "Imágenes de productos: admin sube" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());

create policy "Imágenes de productos: admin elimina" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- Funciones: search_path fijo y sin ejecución directa desde la API donde no hace falta.
-- is_admin() sí debe quedar ejecutable: la usan las políticas y solo dice si quien
-- llama es admin.
-- ─────────────────────────────────────────────────────────────
alter function public.handle_new_user()   set search_path = public;
alter function public.handle_updated_at() set search_path = public;
alter function public.set_updated_at()    set search_path = public;
alter function public.update_updated_at() set search_path = public;

revoke execute on function public.handle_new_user()             from public, anon, authenticated;
revoke execute on function public.protect_profile_privileges()  from public, anon, authenticated;
revoke execute on function public.check_product_subcategory()   from public, anon, authenticated;
