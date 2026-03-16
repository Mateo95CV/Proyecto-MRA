import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Package, ArrowRight } from 'lucide-react';
import { useOrders } from "../context/OrderContext" 
import type { Order } from '../context/OrderContext';

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Leer parámetros de la URL que envía ePayco
  const searchParams = new URLSearchParams(location.search);
  const refPayco = searchParams.get('ref_payco');
  const factura = searchParams.get('factura');
  const valor = searchParams.get('valor');

  // 2. Estado para los items comprados (viene de navigate state o fallback)
  const { purchasedItems = [], orderNumber = 0, total = 0 } = (location.state || {}) as any;

  // 3. Determinar el estado del pago
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending' | 'unknown'>('unknown');

  // Ejemplo con fetch (en useEffect)
  useEffect(() => {
    if (refPayco) {
      fetch(`https://api.epayco.co/payment/${refPayco}/status`, {
        headers: {
          'Authorization': `Bearer 11628620157feab7331f0700c63c4c13`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.estado === 'Aceptada') {
            setPaymentStatus('success');
          } else {
            setPaymentStatus('failed');
          }
        })
        .catch(() => setPaymentStatus('unknown'));
    }
    if (paymentStatus === 'success' && purchasedItems.length > 0) {
    const { addOrder } = useOrders();  // importa useOrders

    const newOrder: Order = {
      id: orderNumber.toString() || `ORD-${Date.now()}`,
      date: new Date().toLocaleString('es-CO'),
      status: 'Pendiente',  // o 'Enviado' si quieres simular
      total,
      items: purchasedItems.map((item: any) => ({
        productId: item.product.id,
        name: item.product.name,
        brand: item.product.brand,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
      })),
      paymentRef: refPayco || undefined,
    };

    addOrder(newOrder);
  }
}, [paymentStatus, purchasedItems, orderNumber, total, refPayco]);
 
  // Si no hay ni estado ni items → redirigir o mostrar vacío
  if (!refPayco && purchasedItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-primary-purple mb-4">No hay información de pago</h1>
          <p className="text-gray-600 mb-8">Parece que no has completado un pago recientemente.</p>
          <Link
            to="/carrito"
            className="bg-primary-purple hover:bg-primary-gold text-white px-8 py-4 rounded-2xl font-bold transition"
          >
            Volver al carrito
          </Link>
        </div>
      </div>
    );
  }

  // Icono y mensaje según estado
  const statusConfig = {
    success: {
      icon: <CheckCircle size={64} className="text-green-600" />,
      title: '¡Pago Exitoso!',
      message: 'Tu pedido ha sido confirmado correctamente.',
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    failed: {
      icon: <XCircle size={64} className="text-red-600" />,
      title: 'Pago Rechazado',
      message: 'No pudimos procesar el pago. Intenta nuevamente.',
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    pending: {
      icon: <Clock size={64} className="text-yellow-600" />,
      title: 'Pago Pendiente',
      message: 'Estamos esperando confirmación del banco o PSE.',
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    unknown: {
      icon: <Package size={64} className="text-gray-600" />,
      title: 'Estado desconocido',
      message: 'No pudimos verificar el estado del pago en este momento.',
      color: 'text-gray-600',
      bg: 'bg-gray-100',
    },
  };

  const currentStatus = statusConfig[paymentStatus];

  return (
    <div className="min-h-screen bg-neutral-light py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden p-8 md:p-12">
        <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-8 ${currentStatus.bg}`}>
          {currentStatus.icon}
        </div>

        <h1 className={`text-4xl md:text-5xl font-bold text-center mb-4 ${currentStatus.color}`}>
          {currentStatus.title}
        </h1>

        <p className="text-xl text-gray-700 text-center mb-2">
          {currentStatus.message}
        </p>

        {refPayco && (
          <p className="text-center text-gray-600 mb-8">
            Referencia de pago: <strong>#{refPayco}</strong>
            {factura && ` • Factura: ${factura}`}
            {valor && ` • Monto: $${Number(valor).toLocaleString('es-CO')}`}
          </p>
        )}

        {/* Productos comprados (solo si hay items) */}
        {purchasedItems.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-6 mb-10">
            <h3 className="text-xl font-semibold text-primary-purple mb-6 text-center">
              Productos en este pedido
            </h3>

            <div className="space-y-6">
              {purchasedItems.map((item: any) => (
                <div key={item.product.id} className="flex gap-4 items-center border-b pb-4 last:border-b-0 last:pb-0">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary-purple">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">{item.product.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">x{item.quantity}</p>
                    <p className="text-primary-gold font-bold">
                      ${(item.product.price * item.quantity).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span className="text-2xl text-primary-gold">${total.toLocaleString('es-CO')}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {paymentStatus === 'success' ? (
            <Link
              to="/perfil"
              className="bg-primary-purple hover:bg-primary-gold text-white px-10 py-4 rounded-2xl font-bold transition flex items-center justify-center gap-2"
            >
              Ver mis pedidos
              <ArrowRight size={20} />
            </Link>
          ) : (
            <button
              onClick={() => navigate('/carrito')}
              className="bg-primary-purple hover:bg-primary-gold text-white px-10 py-4 rounded-2xl font-bold transition"
            >
              Volver al carrito
            </button>
          )}

          <Link
            to="/"
            className="border-2 border-primary-purple text-primary-purple hover:bg-primary-purple hover:text-white px-10 py-4 rounded-2xl font-bold transition text-center"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;