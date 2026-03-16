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

export const products: Product[] = [
  {
    id: '1',
    name: 'Ray-Ban Wayfarer Classic',
    brand: 'Ray-Ban',
    price: 850000,
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'sol',
    description: 'El clásico Wayfarer de Ray-Ban, ícono de estilo desde 1952. Marco robusto en acetato, lentes polarizadas con protección UV400. Perfecto para uso diario y looks casuales.',
    features: ['Lentes polarizadas', 'Protección UV400', 'Marco en acetato premium', 'Almohadillas ajustables'],
    colors: ['Negro', 'Havana', 'Verde G-15'],
    stock: 12,
  },
  {
    id: '2',
    name: 'Oakley Holbrook',
    brand: 'Oakley',
    price: 720000,
    imageUrl: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'deportiva',
    description: 'Modelo Holbrook de Oakley, diseñado para rendimiento y estilo urbano. Tecnología Prizm para mejor contraste y visión en exteriores. Ideal para deportes y actividades al aire libre.',
    features: ['Tecnología Prizm', 'Marco O Matter resistente', 'Lentes Plutonite', 'Grip Unobtanium'],
    colors: ['Negro mate', 'Gris / Rojo', 'Marrón / Prizm'],
    stock: 8,
  },
  // ... agrega description, features, colors y stock a los demás productos
  // Por ahora puedes dejarlos simples o copiar el patrón
];