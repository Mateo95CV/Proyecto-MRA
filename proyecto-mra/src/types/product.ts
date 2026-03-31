// src/types/product.ts
import { supabase } from '../lib/supabaseClient';

// ── Tipos ────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image_url: string;
  category: 'sol' | 'lectura' | 'contacto' | 'infantil' | 'deportiva';
  description: string;
  features: string[];
  colors: string[];
  stock: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type NewProduct = Omit<Product, 'id' | 'active' | 'created_at' | 'updated_at'>;

// ── Queries ──────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();           // ← maybeSingle() no lanza 406 si no encuentra nada

  if (error) throw error;
  return data;
}

export async function getProductsByCategory(
  category: Product['category']
): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createProduct(product: NewProduct): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .maybeSingle();           // ← evita 406 si RLS bloquea el RETURNING

  if (error) throw error;
  if (!data) throw new Error('No se pudo crear el producto. Verifica los permisos en Supabase (RLS).');
  return data;
}

export async function updateProduct(
  id: string,
  updates: Partial<NewProduct>
): Promise<void> {
  // Separamos update y select para evitar el error 406 de RLS
  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ active: false })
    .eq('id', id);

  if (error) throw error;
}

// ── Storage ──────────────────────────────────────────

const BUCKET = 'product-images';

export async function uploadProductImage(file: File): Promise<string> {
  const ext      = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  const filename = imageUrl.split(`${BUCKET}/`).pop();
  if (!filename) return;
  const { error } = await supabase.storage.from(BUCKET).remove([filename]);
  if (error) throw error;
}
