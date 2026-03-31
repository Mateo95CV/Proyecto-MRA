// src/context/CartContext.tsx
// El carrito se guarda en memoria (sessionStorage para persistir al recargar)
// No necesita Supabase — es temporal hasta que el usuario compra
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../types/product';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);
const CART_KEY = 'mra_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = sessionStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Persistir en sessionStorage (se limpia al cerrar la pestaña)
  useEffect(() => {
    try { sessionStorage.setItem(CART_KEY, JSON.stringify(cart)); }
    catch { /* storage lleno */ }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) =>
    setCart(prev => prev.filter(i => i.product.id !== productId));

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) { removeFromCart(productId); return; }
    setCart(prev =>
      prev.map(i => i.product.id === productId ? { ...i, quantity } : i)
    );
  };

  const clearCart = () => {
    setCart([]);
    sessionStorage.removeItem(CART_KEY);
  };

  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const total     = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity,
      clearCart, itemCount, total,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
};
