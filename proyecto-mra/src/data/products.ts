export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  category: 'sol' | 'lectura' | 'contacto' | 'infantil' | 'deportiva';
  description: string;           // ← nuevo
  features?: string[];           // ← opcional: lista de características
  colors?: string[];             // ← opcional: colores disponibles
  stock: number;                 // ← para mostrar disponibilidad
}