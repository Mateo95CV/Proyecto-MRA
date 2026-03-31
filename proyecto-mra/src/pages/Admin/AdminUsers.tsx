// src/pages/Admin/AdminUsers.tsx
import AdminLayout from '../../components/Admin/AdminLayout';
import { Users, ShieldCheck, UserX, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

interface Profile {
  id: string;
  name: string;
  phone: string;
  role: 'user' | 'admin';
  active: boolean;
  created_at: string;
  email?: string;
}

const AdminUsers = () => {
  const [users,   setUsers]   = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  const load = () => {
    setLoading(true);
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setUsers(data as Profile[]);
        setLoading(false);
      });
  };

  useEffect(load, []);

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ active: !current })
      .eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(current ? 'Usuario desactivado' : 'Usuario activado');
    load();
  };

  const toggleRole = async (id: string, current: 'user' | 'admin') => {
    const newRole = current === 'admin' ? 'user' : 'admin';
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Rol cambiado a ${newRole}`);
    load();
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-primary-purple">Gestión de Usuarios</h1>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-gold"
          />
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 size={36} className="animate-spin text-primary-purple" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-primary-purple text-white">
                <tr>
                  <th className="p-4 text-left">Usuario</th>
                  <th className="p-4 text-left">Teléfono</th>
                  <th className="p-4 text-left">Registrado</th>
                  <th className="p-4 text-left">Rol</th>
                  <th className="p-4 text-left">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-purple flex items-center justify-center text-white font-bold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{user.name || '(sin nombre)'}</div>
                          <div className="text-xs text-gray-400 font-mono">{user.id.slice(0,8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{user.phone || '—'}</td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('es-CO')}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-primary-purple'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-2 text-sm ${
                        user.active ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {user.active ? <ShieldCheck size={16} /> : <UserX size={16} />}
                        {user.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleRole(user.id, user.role)}
                        className="text-primary-purple hover:text-primary-gold text-sm font-medium mr-3 transition"
                      >
                        {user.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                      </button>
                      <button
                        onClick={() => toggleActive(user.id, user.active)}
                        className={`text-sm font-medium transition ${
                          user.active ? 'text-red-400 hover:text-red-600' : 'text-green-500 hover:text-green-700'
                        }`}
                      >
                        {user.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-10 text-center text-gray-500">No se encontraron usuarios</div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
