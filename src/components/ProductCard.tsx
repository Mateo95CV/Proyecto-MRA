// src/components/ProductCard.tsx
import type { Product } from '../types/product';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { frameShapeLabel } from '../data/visagismo';

interface ProductCardProps {
  product: Product;
}

const CATEGORY_LABEL: Record<Product['category'], string> = {
  sol: 'Gafas de sol',
  lectura: 'Lectura',
  contacto: 'Lentes de contacto',
  infantil: 'Infantil',
  deportiva: 'Deportiva',
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const soldOut = product.stock === 0;

  // Adaptar a la forma que CartContext espera (imageUrl)
  const cartProduct = {
    ...product,
    imageUrl: product.image_url,
  };

  return (
    <article className="group flex flex-col h-full">
      <Link
        to={`/producto/${product.id}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-white border border-line"
      >
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${soldOut ? 'opacity-60' : ''}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=400&q=60';
          }}
        />
        {soldOut && (
          <span className="absolute top-3 left-3 bg-white/95 text-ink text-xs font-semibold px-2.5 py-1 rounded-full">
            Agotado
          </span>
        )}
      </Link>

      <div className="pt-4 flex flex-col flex-grow">
        <p className="text-xs text-gold-deep font-semibold mb-1">
          {CATEGORY_LABEL[product.category] ?? product.category}
          {product.frame_shape && <span className="text-ink/45 font-medium"> · {frameShapeLabel(product.frame_shape)}</span>}
        </p>
        <Link to={`/producto/${product.id}`} className="hover:text-primary-purple transition-colors">
          <h3 className="font-semibold text-[17px] leading-snug">{product.name}</h3>
        </Link>
        {product.brand && <p className="text-sm text-ink/55 mt-0.5">{product.brand}</p>}

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-lg font-semibold tabular-nums">
            ${product.price.toLocaleString('es-CO')}
          </span>

          <button
            disabled={soldOut}
            onClick={() => {
              addToCart(cartProduct as any);
              toast.success(`${product.name} agregado al carrito`);
            }}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary-purple border border-primary-purple/30 hover:bg-primary-purple hover:text-white hover:border-primary-purple disabled:border-line disabled:text-ink/35 disabled:bg-transparent disabled:cursor-not-allowed pl-3 pr-3.5 py-2 rounded-full transition"
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <Plus size={16} /> Agregar
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
