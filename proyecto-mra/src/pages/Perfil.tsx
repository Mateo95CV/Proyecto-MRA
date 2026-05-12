import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../context/OrderContext';
import {
  Package, Calendar, Loader2, LogOut, LayoutDashboard,
  Shield, Pencil, X, Check, Phone, MapPin, User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import LogoutModal from '../components/LogoutModal';

const STATUS_COLORS: Record<string, string> = {
  Pendiente:  'bg-yellow-100 text-yellow-800',
  Enviado:    'bg-blue-100 text-blue-800',
  Entregado:  'bg-green-100 text-green-800',
  Cancelado:  'bg-red-100 text-red-800',
};

const Perfil = () => {
  const { user, logout, updateProfile } = useAuth();
  const { orders, loadingOrders }       = useOrders();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ── Estado del formulario de edición ──────────────────────────
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [saveMsg, setSaveMsg]   = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const openEdit = () => {
    setForm({
      name:    user?.name    ?? '',
      phone:   user?.phone   ?? '',
      address: user?.address ?? '',
    });
    setFormErrors({});
    setSaveMsg(null);
    setEditing(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'El nombre es obligatorio';
    if (form.phone && !/^[0-9+\s\-()]{7,15}$/.test(form.phone.trim()))
      e.phone = 'Teléfono inválido';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      await updateProfile(form);
      setSaveMsg({ type: 'ok', text: '¡Perfil actualizado correctamente!' });
      setEditing(false);
    } catch {
      setSaveMsg({ type: 'err', text: 'Error al guardar. Intenta de nuevo.' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="p-10 text-center">Cargando perfil...</div>;

  return (
    <>
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={() => { setShowLogoutModal(false); logout(); }}
        onCancel={() => setShowLogoutModal(false)}
      />
      <div className="max-w-5xl mx-auto p-6 md:p-10">
        <h1 className="text-4xl font-bold text-primary-purple mb-10">Mi Perfil</h1>

        {/* ── Tarjeta de datos personales ─────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">

          {/* Cabecera: avatar + nombre + acciones */}
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary-purple rounded-full flex items-center justify-center text-white text-3xl font-bold shrink-0">
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

            <div className="flex items-center gap-3">
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 bg-primary-purple hover:bg-purple-900 text-white px-5 py-2.5 rounded-xl font-bold transition text-sm"
                >
                  <LayoutDashboard size={18} />
                  Panel Admin
                </Link>
              )}
              {!editing && (
                <button
                  onClick={openEdit}
                  className="flex items-center gap-2 border border-primary-purple text-primary-purple hover:bg-primary-purple hover:text-white px-5 py-2.5 rounded-xl font-semibold transition text-sm"
                >
                  <Pencil size={16} />
                  Editar perfil
                </button>
              )}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium transition text-sm"
              >
                <LogOut size={18} /> Cerrar sesión
              </button>
            </div>
          </div>

          {/* Mensaje de guardado */}
          {saveMsg && !editing && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium ${
              saveMsg.type === 'ok'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {saveMsg.type === 'ok' ? <Check size={16} /> : <X size={16} />}
              {saveMsg.text}
            </div>
          )}

          {/* ── Modo visualización ──────────────────────────────── */}
          {!editing && (
            <div className="grid sm:grid-cols-3 gap-4">
              <InfoField icon={User}   label="Nombre"    value={user.name} />
              <InfoField icon={Phone}  label="Teléfono"  value={user.phone   || 'No registrado'} empty={!user.phone} />
              <InfoField icon={MapPin} label="Dirección" value={user.address || 'No registrada'} empty={!user.address} />
            </div>
          )}

          {/* ── Modo edición ─────────────────────────────────────── */}
          {editing && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Editar información personal
              </h3>

              <div className="grid sm:grid-cols-3 gap-4 mb-5">
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setFormErrors(p => ({ ...p, name: '' })); }}
                    placeholder="Tu nombre"
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-primary-purple transition ${
                      formErrors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => { setForm(p => ({ ...p, phone: e.target.value })); setFormErrors(p => ({ ...p, phone: '' })); }}
                    placeholder="Ej: 314 603 0432"
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:border-primary-purple transition ${
                      formErrors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="Calle, barrio, ciudad"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-purple transition"
                  />
                </div>
              </div>

              {/* Nota email */}
              <p className="text-xs text-gray-400 mb-5 flex items-center gap-1.5">
                <Shield size={12} />
                El correo electrónico no puede modificarse desde aquí por razones de seguridad.
                Para cambiarlo contáctanos en{' '}
                <a href="mailto:especialistaoptmra04@gmail.com" className="text-primary-purple hover:underline">
                  especialistaoptmra04@gmail.com
                </a>.
              </p>

              {saveMsg && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium ${
                  saveMsg.type === 'ok'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {saveMsg.type === 'ok' ? <Check size={16} /> : <X size={16} />}
                  {saveMsg.text}
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setEditing(false); setSaveMsg(null); }}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-sm transition"
                >
                  <X size={16} /> Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-purple hover:bg-purple-900 disabled:bg-gray-300 text-white font-semibold text-sm transition"
                >
                  {saving
                    ? <><Loader2 size={16} className="animate-spin" /> Guardando...</>
                    : <><Check size={16} /> Guardar cambios</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Aviso Habeas Data ─────────────────────────────────── */}
        <div className="bg-primary-purple/5 border border-primary-purple/20 rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-start gap-4">
          <div className="w-10 h-10 bg-primary-purple/10 rounded-xl flex items-center justify-center shrink-0">
            <Shield size={20} className="text-primary-purple" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-primary-purple mb-1">Tus datos personales</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              De acuerdo con la Ley 1581 de 2012 (Habeas Data), tienes derecho a acceder,
              rectificar, cancelar y oponerte al tratamiento de tus datos personales. Si deseas
              solicitar la eliminación de tu cuenta, contáctanos en{' '}
              <a href="mailto:especialistaoptmra04@gmail.com" className="text-primary-purple font-medium hover:underline">
                especialistaoptmra04@gmail.com
              </a>.
            </p>
            <Link to="/politica-privacidad" className="inline-block mt-3 text-xs text-primary-purple font-semibold hover:underline">
              Ver Política de Privacidad completa →
            </Link>
          </div>
        </div>

        {/* ── Historial de pedidos ──────────────────────────────── */}
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
                      {order.order_items.length > 3 && (
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
    </>
  );
};

// Componente auxiliar para mostrar un campo en modo lectura
const InfoField = ({
  icon: Icon, label, value, empty,
}: {
  icon: React.ElementType; label: string; value: string; empty?: boolean;
}) => (
  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
    <div className="w-8 h-8 bg-primary-purple/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={16} className="text-primary-purple" />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-medium mt-0.5 ${empty ? 'text-gray-400 italic' : 'text-gray-800'}`}>
        {value}
      </p>
    </div>
  </div>
);

export default Perfil;