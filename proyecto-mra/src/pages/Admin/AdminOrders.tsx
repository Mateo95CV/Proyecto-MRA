import AdminLayout from '../../components/Admin/AdminLayout';
import { useOrders } from '../../context/OrderContext'; // ← si ya tienes OrderContext
import { CheckCircle, Clock, XCircle, Truck, DollarSign } from 'lucide-react';
import { useState } from 'react';

const AdminOrders = () => {
  // Si tienes OrderContext, úsalo; si no, simula datos
  const { orders = [] } = useOrders?.() || {}; // opcional, si no existe → []

  // Datos simulados si no hay contexto
  const mockOrders = orders.length > 0 ? orders : [
    {
      id: 'ORD-001',
      date: '15 Mar 2026 14:30',
      status: 'Entregado',
      total: 1850000,
      customer: 'Juan Pérez',
      itemsCount: 3,
    },
    {
      id: 'ORD-002',
      date: '16 Mar 2026 09:15',
      status: 'Enviado',
      total: 950000,
      customer: 'María López',
      itemsCount: 2,
    },
    {
      id: 'ORD-003',
      date: '16 Mar 2026 11:45',
      status: 'Pendiente',
      total: 3200000,
      customer: 'Carlos Ramírez',
      itemsCount: 5,
    },
  ];

  const [filter, setFilter] = useState('todos');

  const filteredOrders = mockOrders.filter(order => 
    filter === 'todos' || order.status.toLowerCase() === filter
  );

  const getStatusBadge = (status: string) => {
    const colors = {
      Pendiente: 'bg-yellow-100 text-yellow-800',
      Enviado: 'bg-blue-100 text-blue-800',
      Entregado: 'bg-green-100 text-green-800',
      Cancelado: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-primary-purple">Gestión de Pedidos</h1>
        
        <div className="flex gap-3">
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
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-primary-purple text-white">
              <tr>
                <th className="p-4 text-left">Pedido</th>
                <th className="p-4 text-left">Cliente</th>
                <th className="p-4 text-left">Fecha</th>
                <th className="p-4 text-left">Estado</th>
                <th className="p-4 text-left">Items</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">{order.id}</td>
                  <td className="p-4">{order.customer}</td>
                  <td className="p-4 text-gray-600">{order.date}</td>
                  <td className="p-4">{getStatusBadge(order.status)}</td>
                  <td className="p-4">{order.itemsCount}</td>
                  <td className="p-4 text-right font-bold text-primary-gold">
                    ${order.total.toLocaleString('es-CO')}
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-primary-purple hover:text-primary-gold mr-3">
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              No hay pedidos en este filtro
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;