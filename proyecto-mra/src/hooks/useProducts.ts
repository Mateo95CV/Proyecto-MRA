// src/hooks/useProducts.ts
// ─────────────────────────────────────────────
//  Hook para consumir productos desde Supabase
// ─────────────────────────────────────────────
import { useState, useEffect } from 'react';
import {
  getProducts,
  getProductsByCategory,
  type Product,
} from '../types/product';

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(
  category?: Product['category']
): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [tick,     setTick]     = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = category
          ? await getProductsByCategory(category)
          : await getProducts();
        if (!cancelled) setProducts(data);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
  }, [category, tick]);

  return {
    products,
    loading,
    error,
    refetch: () => setTick(t => t + 1),
  };
}
