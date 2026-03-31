// src/pages/ProductDetail.tsx
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingCart, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { getProductById, type Product } from '../types/product';

const COLOR_MAP: Record<string, string> = {
  negro: '#111111',
  havana: '#8B5A2B',
  verde: '#4CAF50',
  azul: '#2196F3',
  rojo: '#F44336',
  rosa: '#E91E8C',
  gris: '#9E9E9E',
  marrón: '#795548',
  dorado: '#D4AF37',
  carey: '#6B3A2A',
  blanco: '#F5F5F5',
};

function getColorHex(color: string): string {
  const lower = color.toLowerCase();
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return hex;
  }
  return '#cccccc';
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct]   = useState<Product | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getProductById(id)
      .then(data => {
        setProduct(data);
        if (data?.colors?.length) setSelectedColor(data.colors[0]);
      })
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Estados de carga / error ──────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light">
        <Loader2 size={48} className="animate-spin text-primary-purple" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light">
        <div className="text-center p-10">
          <h1 className="text-4xl font-bold text-primary-purple mb-4">
            {error ?? 'Producto no encontrado'}
          </h1>
          <Link to="/" className="text-primary-gold hover:underline text-lg">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const cartProduct = { ...product, imageUrl: product.image_url };

  return (
    <div className="min-h-screen bg-neutral-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-purple hover:text-primary-gold mb-8 font-medium transition"
        >
          <ArrowLeft size={20} />
          Volver a la colección
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* Imagen */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-auto object-cover aspect-square lg:aspect-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 uppercase tracking-wide mb-2">
              {product.brand} • {product.category.toUpperCase()}
            </span>

            <h1 className="text-4xl md:text-5xl font-bold text-primary-purple mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-bold text-primary-gold">
                ${product.price.toLocaleString('es-CO')}
              </span>
              {product.stock > 0 ? (
                <span className="text-green-600 text-lg font-medium flex items-center gap-1">
                  <CheckCircle size={20} />
                  En stock ({product.stock} disponibles)
                </span>
              ) : (
                <span className="text-red-600 text-lg font-medium">Agotado</span>
              )}
            </div>

            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Características */}
            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-primary-purple mb-4">
                  Características destacadas
                </h3>
                <ul className="space-y-2">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle size={18} className="text-primary-gold mt-1 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Colores */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-primary-purple mb-3">
                  Color:{' '}
                  <span className="font-normal text-gray-600">{selectedColor}</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                      className={`w-10 h-10 rounded-full border-4 transition ${
                        selectedColor === color
                          ? 'border-primary-gold scale-110'
                          : 'border-gray-200 hover:border-primary-gold'
                      }`}
                      style={{ backgroundColor: getColorHex(color) }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button
                disabled={product.stock === 0}
                onClick={() => {
                  addToCart(cartProduct as any);
                  toast.success(`¡${product.name} agregado al carrito!`, {
                    duration: 4000,
                    icon: '🛒',
                  });
                }}
                className="flex-1 bg-primary-purple hover:bg-primary-gold disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-5 px-8 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-3"
              >
                <ShoppingCart size={24} />
                {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
              </button>

              <button
                disabled={product.stock === 0}
                onClick={() => {
                  addToCart(cartProduct as any);
                  navigate('/checkout');
                }}
                className="flex-1 bg-white border-2 border-primary-purple text-primary-purple hover:bg-primary-purple hover:text-white disabled:opacity-40 disabled:cursor-not-allowed py-5 px-8 rounded-2xl font-bold text-lg transition"
              >
                Comprar ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
