import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminSidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-primary-purple text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-purple-700">
        <h1 className="text-2xl font-bold">Óptica MRA Admin</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/admin"
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                isActive('/admin') ? 'bg-primary-gold text-primary-purple' : 'hover:bg-purple-800'
              }`}
            >
              <LayoutDashboard />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/admin/productos"
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                isActive('/admin/productos') ? 'bg-primary-gold text-primary-purple' : 'hover:bg-purple-800'
              }`}
            >
              <Package />
              Productos
            </Link>
          </li>
          <li>
            <Link
              to="/admin/pedidos"
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                isActive('/admin/pedidos') ? 'bg-primary-gold text-primary-purple' : 'hover:bg-purple-800'
              }`}
            >
              <ShoppingCart />
              Pedidos
            </Link>
          </li>
          <li>
            <Link
              to="/admin/usuarios"
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                isActive('/admin/usuarios') ? 'bg-primary-gold text-primary-purple' : 'hover:bg-purple-800'
              }`}
            >
              <Users />
              Usuarios
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-purple-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-800 transition"
        >
          <LogOut size={20} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;