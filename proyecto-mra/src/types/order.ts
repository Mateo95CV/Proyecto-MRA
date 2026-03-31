// src/types/order.ts
import { supabase } from '../lib/supabaseClient';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  image_url: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'Pendiente' | 'Enviado' | 'Entregado' | 'Cancelado';
  total: number;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_phone: string;
  payment_method: string;
  payment_ref?: string;
  created_at: string;
  order_items?: OrderItem[];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Order | null;
}

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), profiles(name, phone)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function updateOrderStatus(
  id: string,
  status: Order['status']
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}
