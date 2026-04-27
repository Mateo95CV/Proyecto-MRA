import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../context/OrderContext';
import { Package, Calendar, Loader2, LogOut, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_COLORS: Record<string, string> = {
  Pendiente:  'bg-yellow-100 text-yellow-800',
  Enviado:    'bg-blue-100 text-blue-800',
  Entregado:  'bg-green-100 text-green-800',
  Cancelado:  'bg-red-100 text-red-800',
};

const Perfil = () => {
  const { user, logout }             = useAuth();
  const { orders, loadingOrders }    = useOrders();

  if (!user) return <div className="p-10 text-center">Cargando perfil...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      <h1 className="text-4xl font-bold text-primary-purple mb-10">Mi Perfil</h1>

      {/* Datos personales */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary-purple rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary-purple">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full mt-1 inline-block ${
                user.role === 'admin' ? 'bg-purple-100 text-primary-purple' : 'bg-gray-100 text-gray-600'
              }`}>
                {user.role.toUpperCase()}
              </span>
            </div>
          </div>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-2 bg-primary-purple hover:bg-purple-900 text-white px-6 py-3 rounded-xl font-bold transition"
            >
              <LayoutDashboard size={20} />
              Panel de Administración
            </Link>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium transition"
          >
            <LogOut size={20} /> Cerrar sesión
          </button>
        </div>
      </div>

      {/* Historial de pedidos */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-primary-purple mb-6 flex items-center gap-3">
          <Package size={28} /> Mis Pedidos
        </h2>

        {loadingOrders ? (
          <div className="flex justify-center py-12">
            <Loader2 size={40} className="animate-spin text-primary-purple" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">Aún no tienes pedidos</p>
            <Link to="/" className="text-primary-gold hover:underline mt-4 inline-block font-medium">
              Explorar productos →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-primary-purple">
                      Pedido #{order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Calendar size={14} />
                      {new Date(order.created_at).toLocaleDateString('es-CO', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100'}`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-primary-gold text-lg">
                      ${order.total.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>

                {/* Miniaturas de productos */}
                {order.order_items && order.order_items.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {order.order_items.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div>
                          <p className="text-xs font-medium text-gray-700">{item.name}</p>
                          <p className="text-xs text-gray-400">x{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {(order.order_items.length > 3) && (
                      <span className="text-sm text-gray-400 self-center">
                        +{order.order_items.length - 3} más
                      </span>
                    )}
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  {order.shipping_address} · {order.shipping_phone}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Perfil;
