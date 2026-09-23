import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../types/product';
import { FACE_SHAPES, RECOMMENDATIONS, isFaceShape } from '../data/visagismo';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('todos');
  const [sortBy,  setSortBy]  = useState<SortOption>('recientes');
  const { products, loading, error } = useProducts();

  // La búsqueda y el rostro viven en la URL para poder enlazarlos desde el Navbar y el visagismo
  const search = searchParams.get('q') ?? '';
  const rostroParam = searchParams.get('rostro');
  const rostro = isFaceShape(rostroParam) ? rostroParam : null;
  const rostroLabel = rostro ? FACE_SHAPES.find(s => s.id === rostro)!.label.toLowerCase() : '';
  const recomendadas = rostro ? RECOMMENDATIONS[rostro].recomendadas : [];

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  // Filtrar
  const filtered = products
    .filter(p => activeCategory === 'todos' || p.category === activeCategory)
    .filter(p => !rostro || (!!p.frame_shape && recomendadas.includes(p.frame_shape)))
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
    setSortBy('recientes');
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = activeCategory !== 'todos' || search.trim() !== '' || sortBy !== 'recientes' || !!rostro;

  return (
    <main className="min-h-screen bg-white">

      {/* Encabezado */}
      <div className="border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <h1 className="text-5xl md:text-6xl font-semibold">Catálogo de monturas</h1>
          <p className="text-ink/60 text-lg mt-3 max-w-xl">
            Encuentra el par perfecto entre toda nuestra colección.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filtro por rostro (desde el visagismo) */}
        {rostro && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-plum text-white px-5 py-4">
            <p className="text-sm">
              Monturas recomendadas para rostro <span className="font-semibold text-primary-gold">{rostroLabel}</span>
            </p>
            <button
              onClick={() => updateParam('rostro', '')}
              className="flex items-center gap-1.5 text-sm text-white/75 hover:text-white transition"
            >
              <X size={15} /> Quitar filtro
            </button>
          </div>
        )}

        {/* Barra de búsqueda + orden */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="search"
              value={search}
              onChange={e => updateParam('q', e.target.value)}
              placeholder="Buscar por nombre, marca…"
              aria-label="Buscar en el catálogo"
              className="w-full pl-11 pr-10 py-3 border border-line rounded-full bg-white focus:outline-none focus:border-primary-purple text-sm transition"
            />
            {search && (
              <button
                onClick={() => updateParam('q', '')}
                aria-label="Borrar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            aria-label="Ordenar productos"
            className="border border-line rounded-full bg-white px-5 py-3 text-sm focus:outline-none focus:border-primary-purple transition cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Filtros de categoría */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {CATEGORIES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveCategory(value)}
              aria-pressed={activeCategory === value}
              className={`shrink-0 px-4 py-2 rounded-full border font-medium text-sm transition
                ${activeCategory === value
                  ? 'bg-ink text-white border-ink'
                  : 'bg-white border-line text-ink/70 hover:border-ink/40 hover:text-ink'
                }`}
            >
              {label}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="shrink-0 px-4 py-2 rounded-full text-sm font-medium text-ink/60 hover:text-primary-purple transition flex items-center gap-1.5"
            >
              <X size={14} /> Limpiar filtros
            </button>
          )}
        </div>

        {/* Contador de resultados */}
        {!loading && !error && (
          <p className="text-sm text-ink/55 mb-6">
            {sorted.length === 0
              ? 'Sin resultados'
              : `${sorted.length} producto${sorted.length !== 1 ? 's' : ''}`
            }
            {activeCategory !== 'todos' && (
              <span className="ml-1">
                en <span className="font-semibold text-ink capitalize">{activeCategory}</span>
              </span>
            )}
          </p>
        )}

        {/* Estados de carga / error */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-2 border-primary-purple border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 py-16">
            No pudimos cargar los productos: {error}
          </div>
        )}

        {/* Grid de productos */}
        {!loading && !error && (
          <>
            {sorted.length === 0 ? (
              <div className="text-center py-20 max-w-md mx-auto">
                <p className="font-display text-3xl font-semibold mb-2">No encontramos productos</p>
                <p className="text-ink/55 text-sm mb-6">
                  {rostro
                    ? 'Todavía no hay monturas etiquetadas para esta forma de rostro. Escríbenos y te asesoramos en persona.'
                    : 'Prueba con otros términos o cambia los filtros.'}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-primary-purple text-white rounded-full text-sm font-semibold hover:bg-plum transition"
                  >
                    Ver todos los productos
                  </button>
                  {rostro && (
                    <Link
                      to="/citas"
                      className="px-6 py-2.5 border border-line rounded-full text-sm font-semibold hover:border-primary-purple transition"
                    >
                      Agendar asesoría
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
                {sorted.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default Monturas;
