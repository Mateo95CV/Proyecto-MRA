import { useParams, Link, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { ShoppingCart, ArrowLeft, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light">
        <div className="text-center p-10">
          <h1 className="text-4xl font-bold text-primary-purple mb-4">Producto no encontrado</h1>
          <Link to="/" className="text-primary-gold hover:underline text-lg">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-purple hover:text-primary-gold mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Volver a la colección
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Imagen principal */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-auto object-cover aspect-square lg:aspect-auto"
            />
          </div>

          {/* Información */}
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 uppercase tracking-wide mb-2">
              {product.brand} • {product.category.toUpperCase()}
            </span>
            
            <h1 className="text-4xl md:text-5xl font-bold text-primary-purple mb-4">
              {product.name}
            </h1>

            <div className="text-4xl font-bold text-primary-gold mb-6">
              ${product.price.toLocaleString('es-CO')}
              {product.stock > 0 ? (
                <span className="ml-4 text-green-600 text-xl font-medium flex items-center gap-2">
                  <CheckCircle size={20} /> En stock
                </span>
              ) : (
                <span className="ml-4 text-red-600 text-xl font-medium">Agotado</span>
              )}
            </div>

            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              {product.description}
            </p>

            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-primary-purple mb-4">Características destacadas</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle size={18} className="text-primary-gold mt-1 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-primary-purple mb-4">Colores disponibles</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-10 h-10 rounded-full border-2 border-gray-200 cursor-pointer hover:border-primary-gold transition"
                      style={{ backgroundColor: color.toLowerCase().includes('negro') ? '#000' : 
                                               color.toLowerCase().includes('havana') ? '#8B5A2B' : 
                                               color.toLowerCase().includes('verde') ? '#4CAF50' : '#ccc' }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button
                onClick={() => {
                  addToCart(product);
                  toast.success(`¡${product.name} agregado al carrito!`, {
                    duration: 4000,
                    icon: '🛒',
                  });
                }}
                className="flex-1 bg-primary-purple hover:bg-primary-gold text-white py-5 px-8 rounded-2xl font-bold text-lg transition flex items-center justify-center gap-3"
              >
                <ShoppingCart size={24} />
                Agregar al carrito
              </button>
              
              <button className="flex-1 bg-white border-2 border-primary-purple text-primary-purple hover:bg-primary-purple hover:text-white py-5 px-8 rounded-2xl font-bold text-lg transition">
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