import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from "react";

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;              // número de pedido
  date: string;            // fecha de compra
  status: 'Pendiente' | 'Enviado' | 'Entregado' | 'Cancelado';
  total: number;
  items: OrderItem[];
  paymentRef?: string;     // ref_payco si viene de ePayco
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrderById: (id: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | null>(null);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]); // nuevo pedido al inicio
  };

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, getOrderById }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders debe usarse dentro de OrderProvider');
  return context;
};