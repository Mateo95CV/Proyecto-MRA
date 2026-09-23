// Confirmacion de pedido
import { useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { getOrderById, type Order } from '../types/order';

const Confirmation = () => {
  const location  = useLocation();
  const { orderId, purchasedItems = [], total = 0 } = (location.state || {}) as any;

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      getOrderById(orderId).then(setOrder).catch(console.error);
    }
  }, [orderId]);

  if (!orderId && purchasedItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-primary-purple mb-4">Sin información de pedido</h1>
          <Link to="/" className="bg-primary-purple hover:bg-primary-gold text-white px-8 py-4 rounded-2xl font-bold transition">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light py-12 px-4 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12">

        {/* Ícono y título */}
        <div className="mx-auto w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-8">
          <CheckCircle size={56} className="text-green-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-center text-green-600 mb-3">
          ¡Pedido Confirmado!
        </h1>
        <p className="text-xl text-gray-600 text-center mb-2">
          Tu pedido fue registrado exitosamente.
        </p>
        {order && (
          <p className="text-center text-gray-500 mb-8">
            Número de pedido: <strong className="text-primary-purple">#{order.id.slice(0, 8).toUpperCase()}</strong>
          </p>
        )}

        {/* Productos */}
        {purchasedItems.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-primary-purple mb-4">Productos comprados</h3>
            <div className="space-y-4">
              {purchasedItems.map((item: any) => (
                <div key={item.product.id} className="flex gap-4 items-center border-b pb-4 last:border-0 last:pb-0">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary-purple">{item.product.name}</h4>
                    <p className="text-sm text-gray-500">{item.product.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">x{item.quantity}</p>
                    <p className="font-bold text-primary-gold">
                      ${(item.product.price * item.quantity).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between font-bold text-lg">
              <span>Total pagado:</span>
              <span className="text-primary-gold text-xl">${total.toLocaleString('es-CO')}</span>
            </div>
          </div>
        )}

        {/* Info de envío */}
        {order && (
          <div className="bg-purple-50 rounded-2xl p-6 mb-8 text-sm text-gray-700">
            <h3 className="font-semibold text-primary-purple mb-2 flex items-center gap-2">
              <Package size={18} /> Datos de envío
            </h3>
            <p><strong>Destinatario:</strong> {order.shipping_name}</p>
            <p><strong>Dirección:</strong> {order.shipping_address}</p>
            <p><strong>Teléfono:</strong> {order.shipping_phone}</p>
            <p><strong>Pago:</strong> {order.payment_method}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/perfil"
            className="bg-primary-purple hover:bg-primary-gold text-white px-10 py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2"
          >
            Ver mis pedidos <ArrowRight size={20} />
          </Link>
          <Link
            to="/"
            className="border-2 border-primary-purple text-primary-purple hover:bg-primary-purple hover:text-white px-10 py-4 rounded-2xl font-bold transition text-center"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
