import type { Product } from '../data/products';
import { ShoppingCart } from 'lucide-react';
import { Link } from "react-router-dom"
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  return (
    
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full">

      <div className="relative aspect-square">
        <Link to={`/producto/${product.id}`}>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
          />
        </Link>
        <span className="absolute top-3 right-3 bg-primary-purple text-white text-xs font-bold px-3 py-1 rounded-full">
          {product.category.toUpperCase()}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/producto/${product.id}`}>
          <h3 className="text-lg font-bold text-primary-purple mb-1 hover:text-primary-gold transition cursor-pointer">
            {product.name}
          </h3>
        </Link>
        {/* ... resto igual */}
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-primary-purple mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{product.brand}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-primary-gold">
            ${product.price.toLocaleString('es-CO')}
          </span>
          
          <button
            onClick={() => {
              addToCart(product);
              toast.success(`¡${product.name} agregado al carrito!`, {
                duration: 4000,
                icon: '🛒',
              });
            }}
            className="bg-primary-purple hover:bg-primary-gold text-white p-3 rounded-full transition"
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