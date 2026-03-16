import AdminLayout from '../../components/Admin/AdminLayout';
import { Package, ShoppingCart, DollarSign, Users } from 'lucide-react';

const AdminDashboard = () => {
  // Datos simulados (después puedes traerlos de un contexto o API)
  const stats = {
    productos: 48,
    pedidosHoy: 12,
    ventasMes: 28500000,
    usuariosActivos: 156,
  };

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Productos totales</p>
              <p className="text-3xl font-bold text-primary-purple">{stats.productos}</p>
            </div>
            <Package size={40} className="text-primary-gold opacity-70" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pedidos hoy</p>
              <p className="text-3xl font-bold text-primary-purple">{stats.pedidosHoy}</p>
            </div>
            <ShoppingCart size={40} className="text-primary-gold opacity-70" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ventas este mes</p>
              <p className="text-3xl font-bold text-primary-purple">
                ${stats.ventasMes.toLocaleString('es-CO')}
              </p>
            </div>
            <DollarSign size={40} className="text-primary-gold opacity-70" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuarios activos</p>
              <p className="text-3xl font-bold text-primary-purple">{stats.usuariosActivos}</p>
            </div>
            <Users size={40} className="text-primary-gold opacity-70" />
          </div>
        </div>
      </div>

      {/* Puedes agregar gráficos, tablas recientes, etc. */}
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-primary-purple mb-6">Actividad reciente</h2>
        <p className="text-gray-600">Aquí irán los últimos pedidos, productos agregados, etc.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;