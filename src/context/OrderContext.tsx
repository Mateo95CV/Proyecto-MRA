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

// El precio y el total NO se envían: la base de datos los calcula con los precios reales
export interface NewOrderPayload {
  items: { product_id: string; quantity: number }[];
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_phone: string;
  payment_method: string;
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

    // create_order crea el pedido y sus items en una transacción, valida stock
    // y toma precios de la tabla products (ver supabase/migrations/20260923_pedidos_precios_servidor.sql)
    const { data: order, error } = await supabase.rpc('create_order', {
      p_items:            payload.items,
      p_shipping_name:    payload.shipping_name,
      p_shipping_address: payload.shipping_address,
      p_shipping_city:    payload.shipping_city,
      p_shipping_phone:   payload.shipping_phone,
      p_payment_method:   payload.payment_method,
    });

    if (error) throw error;
    if (!order) throw new Error('No se pudo crear el pedido');

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
