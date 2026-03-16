import AdminLayout from '../../components/Admin/AdminLayout';
import { Users, Mail, Phone, ShieldCheck, UserX } from 'lucide-react';
import { useState } from 'react';

const mockUsers = [
  { id: '1', name: 'Juan Pérez', email: 'juan@example.com', phone: '3001234567', role: 'user', active: true },
  { id: '2', name: 'María López', email: 'maria@example.com', phone: '3109876543', role: 'user', active: true },
  { id: '3', name: 'Admin Test', email: 'admin@mra.com', phone: '3125554444', role: 'admin', active: true },
  { id: '4', name: 'Carlos Ramírez', email: 'carlos@example.com', phone: '3201112222', role: 'user', active: false },
];

const AdminUsers = () => {
  const [search, setSearch] = useState('');

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-primary-purple">Gestión de Usuarios</h1>
        
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-gold"
          />
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-primary-purple text-white">
              <tr>
                <th className="p-4 text-left">Usuario</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Teléfono</th>
                <th className="p-4 text-left">Rol</th>
                <th className="p-4 text-left">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.phone}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-primary-purple' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center gap-2 ${
                      user.active ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {user.active ? <ShieldCheck size={18} /> : <UserX size={18} />}
                      {user.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-primary-purple hover:text-primary-gold mr-3">
                      Editar
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      Desactivar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              No se encontraron usuarios
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;