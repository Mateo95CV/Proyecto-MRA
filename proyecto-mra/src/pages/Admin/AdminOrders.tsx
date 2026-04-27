import AdminLayout from '../../components/Admin/AdminLayout';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getAllOrders, updateOrderStatus, type Order } from '../../types/order';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  Pendiente: 'bg-yellow-100 text-yellow-800',
  Enviado:   'bg-blue-100 text-blue-800',
  Entregado: 'bg-green-100 text-green-800',
  Cancelado: 'bg-red-100 text-red-800',
};

const AdminOrders = () => {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('todos');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getAllOrders()
      .then(setOrders)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (id: string, status: Order['status']) => {
    try {
      await updateOrderStatus(id, status);
      toast.success('Estado actualizado');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const filtered = filter === 'todos'
    ? orders
    : orders.filter(o => o.status.toLowerCase() === filter);

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-primary-purple">Gestión de Pedidos</h1>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-primary-gold bg-white"
        >
          <option value="todos">Todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="enviado">Enviados</option>
          <option value="entregado">Entregados</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={40} className="animate-spin text-primary-purple" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-primary-purple text-white">
                <tr>
                  <th className="p-4 text-left">Pedido</th>
                  <th className="p-4 text-left">Cliente</th>
                  <th className="p-4 text-left">Fecha</th>
                  <th className="p-4 text-left">Estado</th>
                  <th className="p-4 text-left">Pago</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <>
                    <tr
                      key={order.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-4 font-mono text-sm font-medium">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{order.shipping_name}</div>
                        <div className="text-xs text-gray-400">{order.shipping_phone}</div>
                      </td>
                      <td className="p-4 text-gray-600 text-sm">
                        {new Date(order.created_at).toLocaleDateString('es-CO')}
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value as Order['status'])}
                          className={`text-sm font-medium px-3 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[order.status]}`}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Entregado">Entregado</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </td>
                      <td className="p-4 text-sm capitalize">{order.payment_method}</td>
                      <td className="p-4 text-right font-bold text-primary-gold">
                        ${order.total.toLocaleString('es-CO')}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                          className="text-primary-purple hover:text-primary-gold text-sm font-medium transition"
                        >
                          {expanded === order.id ? 'Cerrar ▲' : 'Ver ▼'}
                        </button>
                      </td>
                    </tr>
                    {/* Detalle expandible */}
                    {expanded === order.id && order.order_items && (
                      <tr key={`${order.id}-detail`}>
                        <td colSpan={7} className="bg-gray-50 p-6">
                          <p className="text-sm font-semibold text-gray-600 mb-3">
                            📍 {order.shipping_address}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {order.order_items.map((item, i) => (
                              <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                <div>
                                  <p className="text-sm font-medium">{item.name}</p>
                                  <p className="text-xs text-gray-400">
                                    x{item.quantity} · ${item.price.toLocaleString('es-CO')}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length === 0 && (
            <div className="p-10 text-center text-gray-500">No hay pedidos en este filtro</div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
