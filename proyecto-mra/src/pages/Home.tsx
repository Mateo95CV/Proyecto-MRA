// src/pages/Home.tsx
import { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../types/product';

type CategoryFilter = 'todos' | Product['category'];

const CATEGORIES: { label: string; value: CategoryFilter }[] = [
  { label: 'Todos',     value: 'todos'     },
  { label: 'Sol',       value: 'sol'       },
  { label: 'Lectura',   value: 'lectura'   },
  { label: 'Contacto',  value: 'contacto'  },
  { label: 'Infantil',  value: 'infantil'  },
  { label: 'Deportiva', value: 'deportiva' },
];

const Home = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('todos');
  const { products, loading, error } = useProducts();

  const filtered =
    activeCategory === 'todos'
      ? products
      : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div
        className="relative h-[70vh] md:h-[80vh] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=2000&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white px-6 max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
              Óptica MRA
            </h1>
            <p className="text-xl md:text-3xl mb-10 drop-shadow-md">
              Tu visión, nuestra pasión desde Rionegro, Antioquia
            </p>
            <a
              href="#catalogo"
              className="inline-block bg-primary-gold hover:bg-yellow-500 text-primary-purple px-10 py-5 rounded-full text-xl font-bold transition transform hover:scale-105"
            >
              Ver Colección
            </a>
          </div>
        </div>
      </div>

      {/* Catálogo */}
      <section id="catalogo" className="py-16 px-6 md:px-10 bg-neutral-light">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-purple text-center mb-4">
            Nuestras Colecciones
          </h2>
          <p className="text-center text-gray-600 text-lg mb-12 max-w-2xl mx-auto">
            Encuentra el par perfecto para cada ocasión y estilo de vida
          </p>

          {/* Filtros de categoría */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {CATEGORIES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setActiveCategory(value)}
                className={`px-6 py-2 rounded-full border font-medium transition
                  ${activeCategory === value
                    ? 'bg-primary-gold text-primary-purple border-primary-gold'
                    : 'bg-white border-gray-300 hover:border-primary-gold hover:text-primary-gold'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Estado de carga */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center text-red-500 py-10 text-lg">
              Error al cargar productos: {error}
            </div>
          )}

          {/* Grid de productos */}
          {!loading && !error && (
            <>
              {filtered.length === 0 ? (
                <p className="text-center text-gray-500 text-lg py-10">
                  No hay productos en esta categoría aún.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {filtered.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
