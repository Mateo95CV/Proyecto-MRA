import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useNavigate ,Link } from 'react-router-dom';

const Carrito = () => {
  const { cart, removeFromCart, updateQuantity, itemCount, total } = useCart();
  const navigate = useNavigate()

  if (itemCount === 0) {
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-10 min-h-[70vh] flex flex-col items-center justify-center">
        <ShoppingBag size={80} className="text-gray-400 mb-6" />
        <h1 className="text-3xl font-bold text-primary-purple mb-4">Tu carrito está vacío</h1>
        <p className="text-gray-600 text-lg mb-8 text-center max-w-md">
          Parece que no has agregado ningún producto todavía. ¡Explora nuestra colección!
        </p>
        <Link
          to="/"
          className="bg-primary-purple hover:bg-primary-gold text-white px-10 py-4 rounded-2xl font-bold transition"
        >
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <h1 className="text-4xl font-bold text-primary-purple mb-8">Carrito de Compras</h1>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Lista de productos */}
        {cart.map(item => (
          <div
            key={item.product.id}
            className="flex flex-col sm:flex-row items-center gap-6 p-6 border-b last:border-b-0"
          >
            <img
              src={item.product.image_url}
              alt={item.product.name}
              className="w-24 h-24 object-cover rounded-lg"
            />

            <div className="flex-1">
              <h3 className="font-bold text-lg text-primary-purple">{item.product.name}</h3>
              <p className="text-gray-600">{item.product.brand}</p>
              <p className="text-primary-gold font-bold mt-1">
                ${item.product.price.toLocaleString('es-CO')}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-full">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="p-3 hover:bg-gray-100 rounded-l-full"
                >
                  <Minus size={18} />
                </button>
                <span className="px-6 py-2 font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="p-3 hover:bg-gray-100 rounded-r-full"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.product.id)}
                className="text-red-500 hover:text-red-700 p-2"
                title="Eliminar"
              >
                <Trash2 size={22} />
              </button>
            </div>
          </div>
        ))}

        {/* Total y acciones */}
        <div className="p-6 bg-gray-50 border-t">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-bold">Total:</span>
            <span className="text-3xl font-bold text-primary-gold">
              ${total.toLocaleString('es-CO')}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/checkout')}
              className="flex-1 bg-primary-purple hover:bg-primary-gold text-white py-4 rounded-2xl font-bold text-lg transition"
            >
              Proceder al pago
            </button>
            <Link
              to="/"
              className="flex-1 border-2 border-primary-purple text-primary-purple hover:bg-primary-purple hover:text-white py-4 rounded-2xl font-bold text-lg transition text-center"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito;