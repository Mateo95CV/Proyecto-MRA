// src/pages/Checkout.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const { addOrder }               = useOrders();
  const { user }                   = useAuth();
  const navigate                   = useNavigate();
  const [saving, setSaving]        = useState(false);

  const [formData, setFormData] = useState({
    nombre:      user?.name ?? '',
    direccion:   '',
    ciudad:      '',
    departamento:'Antioquia',
    telefono:    '',
    metodoPago:  'contraentrega',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.nombre.trim())    e.nombre    = 'Requerido';
    if (!formData.direccion.trim()) e.direccion = 'Requerido';
    if (!formData.ciudad.trim())    e.ciudad    = 'Requerido';
    if (!formData.telefono.trim())  e.telefono  = 'Requerido';
    else if (!/^\d{7,10}$/.test(formData.telefono.replace(/\D/g, '')))
      e.telefono = 'Teléfono inválido (7-10 dígitos)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { toast.error('Completa todos los campos requeridos'); return; }

    setSaving(true);
    try {
      const order = await addOrder({
        items: cart.map(i => ({
          product_id: i.product.id,
          name:       i.product.name,
          brand:      i.product.brand,
          price:      i.product.price,
          quantity:   i.quantity,
          image_url:  i.product.image_url,
        })),
        total,
        shipping_name:    formData.nombre,
        shipping_address: `${formData.direccion}, ${formData.ciudad}, ${formData.departamento}`,
        shipping_city:    formData.ciudad,
        shipping_phone:   formData.telefono,
        payment_method:   formData.metodoPago,
      });

      clearCart();
      toast.success('¡Pedido confirmado! 🎉', { duration: 5000 });
      navigate('/confirmacion', { state: { orderId: order.id, purchasedItems: cart, total } });
    } catch (err: any) {
      toast.error(`Error al procesar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-10 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <AlertCircle size={80} className="text-gray-400 mb-6" />
        <h1 className="text-3xl font-bold text-primary-purple mb-4">Tu carrito está vacío</h1>
        <button onClick={() => navigate('/')} className="bg-primary-purple hover:bg-primary-gold text-white px-10 py-4 rounded-2xl font-bold transition">
          Volver a la tienda
        </button>
      </div>
    );
  }

  const inputClass = (field: string) =>
    `w-full p-3 border ${errors[field] ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:border-primary-gold`;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary-purple hover:text-primary-gold mb-8 font-medium">
        <ArrowLeft size={20} /> Volver al carrito
      </button>
      <h1 className="text-4xl font-bold text-primary-purple mb-10">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

        {/* Resumen */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-primary-purple mb-6">Resumen del pedido</h2>
          {cart.map(item => (
            <div key={item.product.id} className="flex gap-4 py-4 border-b last:border-b-0">
              <img src={item.product.image_url} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg" />
              <div className="flex-1">
                <h3 className="font-semibold text-primary-purple">{item.product.name}</h3>
                <p className="text-sm text-gray-600">{item.product.brand}</p>
                <p className="text-sm mt-1">Cantidad: <span className="font-medium">{item.quantity}</span></p>
              </div>
              <div className="text-right font-bold text-primary-gold">
                ${(item.product.price * item.quantity).toLocaleString('es-CO')}
              </div>
            </div>
          ))}
          <div className="mt-8 pt-6 border-t">
            <div className="flex justify-between text-lg mb-3">
              <span>Subtotal:</span><span>${total.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-lg mb-3">
              <span>Envío:</span><span className="text-green-600">Gratis</span>
            </div>
            <div className="flex justify-between text-2xl font-bold mt-4">
              <span>Total:</span>
              <span className="text-primary-gold">${total.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-primary-purple mb-6">Información de envío</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className={inputClass('nombre')} />
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className={inputClass('direccion')} />
                {errors.direccion && <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                  <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} className={inputClass('ciudad')} />
                  {errors.ciudad && <p className="text-red-500 text-sm mt-1">{errors.ciudad}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                  <select name="departamento" value={formData.departamento} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-gold bg-white">
                    <option>Antioquia</option>
                    <option>Bogotá D.C.</option>
                    <option>Valle del Cauca</option>
                    <option>Cundinamarca</option>
                    <option>Atlántico</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className={inputClass('telefono')} />
                {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-semibold text-primary-purple mb-4">Método de pago</h3>
                <div className="space-y-3">
                  {[
                    { value: 'tarjeta',       label: 'Tarjeta de crédito / débito' },
                    { value: 'transferencia', label: 'Transferencia / Consignación' },
                    { value: 'contraentrega', label: 'Contraentrega (pago al recibir)' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-primary-gold transition">
                      <input
                        type="radio"
                        name="metodoPago"
                        value={opt.value}
                        checked={formData.metodoPago === opt.value}
                        onChange={handleChange}
                      />
                      <span className="font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary-purple hover:bg-primary-gold disabled:bg-gray-400 text-white py-5 rounded-2xl font-bold text-xl transition mt-4 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={22} className="animate-spin" />}
                {saving ? 'Procesando...' : `Confirmar pedido · $${total.toLocaleString('es-CO')}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
