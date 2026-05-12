import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../types/product';

type CategoryFilter = 'todos' | Product['category'];
type SortOption = 'recientes' | 'precio-asc' | 'precio-desc' | 'nombre';

const CATEGORIES: { label: string; value: CategoryFilter;}[] = [
  { label: 'Todos',     value: 'todos', },
  { label: 'Sol',       value: 'sol', },
  { label: 'Lectura',   value: 'lectura', },
  { label: 'Contacto',  value: 'contacto', },
  { label: 'Infantil',  value: 'infantil', },
  { label: 'Deportiva', value: 'deportiva', },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Más recientes',    value: 'recientes'   },
  { label: 'Precio: menor',    value: 'precio-asc'  },
  { label: 'Precio: mayor',    value: 'precio-desc' },
  { label: 'Nombre A–Z',       value: 'nombre'      },
];

const Monturas = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('todos');
  const [search,  setSearch]  = useState('');
  const [sortBy,  setSortBy]  = useState<SortOption>('recientes');
  const { products, loading, error } = useProducts();

  // Filtrar
  const filtered = products
    .filter(p => activeCategory === 'todos' || p.category === activeCategory)
    .filter(p => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    });

  // Ordenar
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'precio-asc')  return a.price - b.price;
    if (sortBy === 'precio-desc') return b.price - a.price;
    if (sortBy === 'nombre')      return a.name.localeCompare(b.name);
    return 0; // recientes: ya vienen ordenados por created_at desc desde Supabase
  });

  const clearFilters = () => {
    setActiveCategory('todos');
    setSearch('');
    setSortBy('recientes');
  };

  const hasActiveFilters = activeCategory !== 'todos' || search.trim() !== '' || sortBy !== 'recientes';

  return (
    <div className="min-h-screen bg-neutral-light">

      {/* Encabezado */}
      <div className="bg-primary-purple text-white py-14 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Catálogo de Monturas</h1>
        <p className="text-purple-200 text-lg max-w-xl mx-auto">
          Encuentra el par perfecto entre toda nuestra colección
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Barra de búsqueda + orden */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, marca..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:border-primary-purple text-sm transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-gray-400 shrink-0" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="border border-gray-200 rounded-2xl bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary-purple transition cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtros de categoría */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveCategory(value)}
              className={`px-4 py-2 rounded-full border font-medium text-sm transition flex items-center gap-1.5
                ${activeCategory === value
                  ? 'bg-primary-purple text-white border-primary-purple shadow-md'
                  : 'bg-white border-gray-200 hover:border-primary-purple hover:text-primary-purple'
                }`}
            >
              <span>{}</span> {label}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-full border border-red-200 text-red-500 hover:bg-red-50 font-medium text-sm transition flex items-center gap-1.5"
            >
              <X size={14} /> Limpiar filtros
            </button>
          )}
        </div>

        {/* Contador de resultados */}
        {!loading && !error && (
          <p className="text-sm text-gray-500 mb-6">
            {sorted.length === 0
              ? 'Sin resultados'
              : `${sorted.length} producto${sorted.length !== 1 ? 's' : ''} encontrado${sorted.length !== 1 ? 's' : ''}`
            }
            {activeCategory !== 'todos' && (
              <span className="ml-1">
                en <span className="font-semibold text-primary-purple capitalize">{activeCategory}</span>
              </span>
            )}
          </p>
        )}

        {/* Estados de carga / error */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <div className="w-12 h-12 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 py-16 text-lg">
            Error al cargar productos: {error}
          </div>
        )}

        {/* Grid de productos */}
        {!loading && !error && (
          <>
            {sorted.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-xl font-semibold text-gray-600 mb-2">
                  No encontramos productos
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Prueba con otros términos o cambia los filtros
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-primary-purple text-white rounded-full text-sm font-semibold hover:bg-purple-900 transition"
                >
                  Ver todos los productos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sorted.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Monturas;