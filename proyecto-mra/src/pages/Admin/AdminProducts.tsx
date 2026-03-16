import AdminLayout from '../../components/Admin/AdminLayout';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import AdminProductImgUpload from '../../components/Admin/AdminProductImgUpload'

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Ray-Ban Wayfarer', price: 850000, stock: 12, category: 'Sol' },
    { id: '2', name: 'Oakley Holbrook', price: 720000, stock: 8, category: 'Deportiva' },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    imageFile: null as File | null,
    imagePreview: null as string | null
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error('Nombre y precio son obligatorios');
      return;
    }

    const newProduct = {
      id: Date.now().toString(),
      name: formData.name,
      price: Number(formData.price),
      stock: Number(formData.stock) || 0,
      category: formData.category,
    };

    setProducts([...products, newProduct]);
    setFormData({ name: '', price: '', stock: '', category: '', imageFile: null as File | null, imagePreview: null as string | null});
    setShowForm(false);
    toast.success('Producto agregado correctamente');
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Seguro que quieres eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== id));
      toast.success('Producto eliminado');
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-purple">Gestión de Productos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-purple hover:bg-primary-gold text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition"
        >
          <Plus size={20} />
          Agregar producto
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-lg mb-10">
          <h2 className="text-2xl font-bold text-primary-purple mb-6">Nuevo Producto</h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-gold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio (COP) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-gold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-gold bg-white"
              >
                <option value="">Selecciona...</option>
                <option value="Sol">Sol</option>
                <option value="Lectura">Lectura</option>
                <option value="Contacto">Contacto</option>
                <option value="Deportiva">Deportiva</option>
                <option value="Infantil">Infantil</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <AdminProductImgUpload
                onImageChange={(file) => {
                  // Aquí guardas el archivo en el estado del formulario
                  setFormData(prev => ({ ...prev, imageFile: file }));
                  console.log('Imagen seleccionada:', file?.name);
                }}
                initialImage={'/src/assets/gafas/gafas1.png'}
              />
            </div>

            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-primary-purple hover:bg-primary-gold text-white py-4 rounded-xl font-bold transition"
              >
                Guardar producto
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-300 hover:bg-gray-100 py-4 rounded-xl font-bold transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary-purple text-white">
            <tr>
              <th className="p-4 text-left">Producto</th>
              <th className="p-4 text-left">Categoría</th>
              <th className="p-4 text-left">Precio</th>
              <th className="p-4 text-left">Stock</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{product.name}</td>
                <td className="p-4">{product.category}</td>
                <td className="p-4 font-medium text-primary-gold">
                  ${product.price.toLocaleString('es-CO')}
                </td>
                <td className="p-4">{product.stock}</td>
                <td className="p-4 text-right">
                  <button className="text-primary-purple hover:text-primary-gold mr-3">
                    <Edit size={20} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No hay productos registrados aún
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;