import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

// Tipos
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

export interface NewOrderPayload {
  items: { product_id: string; name: string; brand: string; price: number; quantity: number; image_url: string }[];
  total: number;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_phone: string;
  payment_method: string;
  payment_ref?: string;
}

interface OrderContextType {
  orders: Order[];
  loadingOrders: boolean;
  addOrder: (payload: NewOrderPayload) => Promise<Order>;
  getOrderById: (id: string) => Promise<Order | null>;
  refetchOrders: () => void;
}

const OrderContext = createContext<OrderContextType | null>(null);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const {session } = useAuth();
  const [orders, setOrders]             = useState<Order[]>([]);
  const [loadingOrders, setLoading]     = useState(false);
  const [tick, setTick]                 = useState(0);

  // Cargar pedidos del usuario autenticado
  useEffect(() => {
    if (!session?.user) { setOrders([]); return; }

    setLoading(true);
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setOrders(data as Order[]);
        setLoading(false);
      });
  }, [session, tick]);

  // Crear pedido
  const addOrder = async (payload: NewOrderPayload): Promise<Order> => {
    if (!session?.user) throw new Error('Debes iniciar sesión para hacer un pedido');

    // 1. Insertar pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id:          session.user.id,
        total:            payload.total,
        shipping_name:    payload.shipping_name,
        shipping_address: payload.shipping_address,
        shipping_city:    payload.shipping_city,
        shipping_phone:   payload.shipping_phone,
        payment_method:   payload.payment_method,
        payment_ref:      payload.payment_ref,
      }])
      .select()
      .maybeSingle();

    if (orderError) throw orderError;
    if (!order) throw new Error('No se pudo crear el pedido');

    // 2. Insertar items
    const itemsToInsert = payload.items.map(item => ({
      order_id:   order.id,
      product_id: item.product_id,
      name:       item.name,
      brand:      item.brand,
      price:      item.price,
      quantity:   item.quantity,
      image_url:  item.image_url,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    setTick(t => t + 1);
    return order as Order;
  };

  // Obtener un pedido por ID
  const getOrderById = async (id: string): Promise<Order | null> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Order | null;
  };

  return (
    <OrderContext.Provider value={{
      orders,
      loadingOrders,
      addOrder,
      getOrderById,
      refetchOrders: () => setTick(t => t + 1),
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders debe usarse dentro de OrderProvider');
  return ctx;
};
