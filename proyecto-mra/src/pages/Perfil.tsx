import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { Package, User, Calendar, DollarSign, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Perfil = () => {
  const { user } = useAuth();
  const { orders } = useOrders();

  if (!user) {
    return <div className="p-10 text-center">Cargando perfil...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <h1 className="text-4xl font-bold text-primary-purple mb-10">Mi Perfil</h1>

      {/* Datos personales */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-primary-purple rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary-purple">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* Botones de edición (placeholder) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="border border-primary-purple text-primary-purple hover:bg-primary-purple hover:text-white py-3 rounded-xl font-medium transition">
            Editar datos personales
          </button>
          <button className="border border-primary-purple text-primary-purple hover:bg-primary-purple hover:text-white py-3 rounded-xl font-medium transition">
            Cambiar contraseña
          </button>
        </div>
      </div>

      {/* Historial de pedidos */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-primary-purple mb-6 flex items-center gap-3">
          <Package size={28} />
          Mis Pedidos
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-xl text-gray-600">Aún no tienes pedidos</p>
            <Link to="/" className="text-primary-gold hover:underline mt-4 inline-block">
              Explorar productos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-primary-purple">
                      Pedido #{order.id}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <Calendar size={16} />
                      {order.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                      order.status === 'Entregado' ? 'bg-green-100 text-green-800' :
                      order.status === 'Enviado' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Cancelado' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-primary-gold">
                      ${order.total.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-4">
                  {order.items.slice(0, 3).map(item => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-600">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-sm text-gray-500">+{order.items.length - 3} más</span>
                  )}
                </div>

                <Link
                  to={`/pedido/${order.id}`}  // puedes crear esta ruta después
                  className="text-primary-gold hover:underline flex items-center gap-2 text-sm font-medium"
                >
                  Ver detalle del pedido
                  <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Perfil;