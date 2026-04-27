// src/components/ProductCard.tsx
import type { Product } from '../types/product';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  // Adaptar a la forma que CartContext espera (imageUrl)
  const cartProduct = {
    ...product,
    imageUrl: product.image_url,
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full">
      <div className="relative aspect-square">
        <Link to={`/producto/${product.id}`}>
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=60';
            }}
          />
        </Link>
        <span className="absolute top-3 right-3 bg-primary-purple text-white text-xs font-bold px-3 py-1 rounded-full">
          {product.category.toUpperCase()}
        </span>
        {product.stock === 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            AGOTADO
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/producto/${product.id}`}>
          <h3 className="text-lg font-bold text-primary-purple mb-1 hover:text-primary-gold transition cursor-pointer">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-1">{product.brand}</p>
        <p className="text-xs text-gray-400 mb-3">
          {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-primary-gold">
            ${product.price.toLocaleString('es-CO')}
          </span>

          <button
            disabled={product.stock === 0}
            onClick={() => {
              addToCart(cartProduct as any);
              toast.success(`¡${product.name} agregado al carrito!`, {
                duration: 4000,
                icon: '🛒',
              });
            }}
            className="bg-primary-purple hover:bg-primary-gold disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-full transition"
            title="Agregar al carrito"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
