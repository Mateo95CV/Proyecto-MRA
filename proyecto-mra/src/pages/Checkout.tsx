import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const epayco = window.ePayco.checkout.configure({
    key: 'TU_PUBLIC_KEY_TEST_AQUI',  // ← pega tu pk_test_...
    test: true,
  });

  if (!window.ePayco) {
    toast.error('Error cargando ePayco. Intenta recargar la página.');
    toast.dismiss('epayco');
    return;
  }

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    departamento: 'Antioquia',
    codigoPostal: '',
    telefono: '',
    metodoPago: 'tarjeta', // por defecto
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección es obligatoria';
    if (!formData.ciudad.trim()) newErrors.ciudad = 'La ciudad es obligatoria';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio';
    else if (!/^\d{7,10}$/.test(formData.telefono.replace(/\D/g, ''))) {
      newErrors.telefono = 'Teléfono inválido (7-10 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    toast.loading('Redirigiendo al pago seguro...', { id: 'epayco' });

    // Datos del pago
    const data = {
      name: formData.nombre,
      description: `Compra en Óptica Luis - Pedido #${Math.floor(100000 + Math.random() * 900000)}`,
      invoice: `INV-${Date.now()}`,
      currency: 'cop',
      amount: total.toString(),
      tax_base: '0',
      tax: '0',
      country: 'co',
      lang: 'es',

      // Datos del cliente
      name_billing: formData.nombre,
      address_billing: formData.direccion,
      type_doc_billing: 'cc',
      mobile_billing: formData.telefono,
      number_doc_billing: '123456789', // ← en producción pedir cédula

      // URL de respuesta (página de confirmación)
      external: 'false',
      response: `${window.location.origin}/confirmacion`,
      confirmation: `${window.location.origin}/api/confirmacion-epayco`, // webhook si tienes backend
    };

    epayco.open(data);

    // Opcional: limpiar toast después de abrir
    setTimeout(() => toast.dismiss('epayco'), 1000);

    setTimeout(() => {
        toast.dismiss('checkout');
        toast.success('¡Pedido confirmado! Gracias por tu compra.', {
        duration: 6000,
        });

        // Guardamos una copia del carrito ANTES de limpiarlo
        const purchasedItems = [...cart];

        clearCart();

        // Redirigimos pasando los items comprados como state
        navigate('/confirmacion', { 
        state: { 
            purchasedItems,
            orderNumber: Math.floor(100000 + Math.random() * 900000),
            total
        }
        });
    }, 2500);
    };

  if (cart.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-10 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <AlertCircle size={80} className="text-gray-400 mb-6" />
        <h1 className="text-3xl font-bold text-primary-purple mb-4">Tu carrito está vacío</h1>
        <p className="text-gray-600 mb-8">No puedes proceder al pago sin productos.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-primary-purple hover:bg-primary-gold text-white px-10 py-4 rounded-2xl font-bold transition"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary-purple hover:text-primary-gold mb-8 font-medium"
      >
        <ArrowLeft size={20} />
        Volver al carrito
      </button>

      <h1 className="text-4xl font-bold text-primary-purple mb-10">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Resumen del carrito - 3 columnas */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-primary-purple mb-6">Resumen del pedido</h2>

          {cart.map(item => (
            <div key={item.product.id} className="flex gap-4 py-4 border-b last:border-b-0">
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-primary-purple">{item.product.name}</h3>
                <p className="text-sm text-gray-600">{item.product.brand}</p>
                <p className="text-sm mt-1">
                  Cantidad: <span className="font-medium">{item.quantity}</span>
                </p>
              </div>
              <div className="text-right font-bold text-primary-gold">
                ${(item.product.price * item.quantity).toLocaleString('es-CO')}
              </div>
            </div>
          ))}

          <div className="mt-8 pt-6 border-t">
            <div className="flex justify-between text-lg mb-3">
              <span>Subtotal:</span>
              <span>${total.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-lg mb-3">
              <span>Envío (estimado):</span>
              <span className="text-green-600">Gratis</span>
            </div>
            <div className="flex justify-between text-2xl font-bold mt-4">
              <span>Total:</span>
              <span className="text-primary-gold">${total.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>

        {/* Formulario de envío y pago - 2 columnas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-primary-purple mb-6">Información de envío</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full p-3 border ${errors.nombre ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:border-primary-gold`}
                />
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección completa *</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  className={`w-full p-3 border ${errors.direccion ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:border-primary-gold`}
                />
                {errors.direccion && <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    className={`w-full p-3 border ${errors.ciudad ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:border-primary-gold`}
                  />
                  {errors.ciudad && <p className="text-red-500 text-sm mt-1">{errors.ciudad}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                  <select
                    name="departamento"
                    value={formData.departamento}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-gold bg-white"
                  >
                    <option value="Antioquia">Antioquia</option>
                    <option value="Bogotá D.C.">Bogotá D.C.</option>
                    <option value="Valle del Cauca">Valle del Cauca</option>
                    {/* Agrega más si quieres */}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className={`w-full p-3 border ${errors.telefono ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:border-primary-gold`}
                />
                {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-primary-purple mb-4">Método de pago</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-primary-gold transition">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="tarjeta"
                      checked={formData.metodoPago === 'tarjeta'}
                      onChange={handleChange}
                      className="text-primary-purple focus:ring-primary-gold"
                    />
                    <span className="font-medium">Tarjeta de crédito/débito</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-primary-gold transition">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="transferencia"
                      checked={formData.metodoPago === 'transferencia'}
                      onChange={handleChange}
                      className="text-primary-purple focus:ring-primary-gold"
                    />
                    <span className="font-medium">Transferencia / Consignación</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-primary-gold transition">
                    <input
                      type="radio"
                      name="metodoPago"
                      value="contraentrega"
                      checked={formData.metodoPago === 'contraentrega'}
                      onChange={handleChange}
                      className="text-primary-purple focus:ring-primary-gold"
                    />
                    <span className="font-medium">Contraentrega (pago al recibir)</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-purple hover:bg-primary-gold text-white py-5 rounded-2xl font-bold text-xl transition mt-8"
              >
                Pagar con ePayco (${total.toLocaleString('es-CO')})
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;