// src/pages/Admin/AdminProducts.tsx
import AdminLayout from '../../components/Admin/AdminLayout';
import { Plus, Edit, Trash2, Loader2, X, Save } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import AdminProductImgUpload from '../../components/Admin/AdminProductImgUpload';
import { useProducts } from '../../hooks/useProducts';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  type Product,
  type NewProduct,
} from '../../types/product';

// ── Tipos del formulario ─────────────────────────────
interface FormState {
  name: string;
  brand: string;
  price: string;
  stock: string;
  category: string;
  description: string;
  imageFile: File | null;
  image_url: string;       // imagen actual (para edición)
}

const EMPTY_FORM: FormState = {
  name: '', brand: '', price: '', stock: '',
  category: '', description: '', imageFile: null, image_url: '',
};

function productToForm(p: Product): FormState {
  return {
    name:        p.name,
    brand:       p.brand,
    price:       String(p.price),
    stock:       String(p.stock),
    category:    p.category,
    description: p.description,
    imageFile:   null,
    image_url:   p.image_url,
  };
}

// ────────────────────────────────────────────────────
const AdminProducts = () => {
  const { products, loading, error, refetch } = useProducts();

  const [mode,      setMode]      = useState<'none' | 'create' | 'edit'>('none');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [formData,  setFormData]  = useState<FormState>(EMPTY_FORM);

  // ── Abrir formulario de creación ──────────────────
  const openCreate = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setMode('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Abrir formulario de edición ───────────────────
  const openEdit = (product: Product) => {
    setFormData(productToForm(product));
    setEditingId(product.id);
    setMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setMode('none');
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  // ── Guardar (crear o editar) ───────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error('Nombre y precio son obligatorios');
      return;
    }

    setSaving(true);
    try {
      // Si se seleccionó nueva imagen, subirla
      let image_url = formData.image_url;
      if (formData.imageFile) {
        image_url = await uploadProductImage(formData.imageFile);
      }

      const payload: NewProduct = {
        name:        formData.name,
        brand:       formData.brand,
        price:       Number(formData.price),
        stock:       Number(formData.stock) || 0,
        category:    formData.category as Product['category'],
        description: formData.description,
        image_url,
        features:    [],
        colors:      [],
      };

      if (mode === 'edit' && editingId) {
        await updateProduct(editingId, payload);
        toast.success('Producto actualizado ✅');
      } else {
        await createProduct(payload);
        toast.success('Producto creado ✅');
      }

      closeForm();
      refetch();
    } catch (err) {
      toast.error(`Error: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Eliminar ──────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteProduct(id);
      toast.success('Producto eliminado');
      refetch();
    } catch (err) {
      toast.error(`Error al eliminar: ${(err as Error).message}`);
    }
  };

  // ── Render ────────────────────────────────────────
  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary-purple">Gestión de Productos</h1>
        {mode === 'none' && (
          <button
            onClick={openCreate}
            className="bg-primary-purple hover:bg-primary-gold text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition"
          >
            <Plus size={20} />
            Agregar producto
          </button>
        )}
      </div>

      {/* ── Formulario crear / editar ──────────────── */}
      {mode !== 'none' && (
        <div className="bg-white p-8 rounded-2xl shadow-lg mb-10 border-l-4 border-primary-gold">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary-purple">
              {mode === 'edit' ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
            </h2>
            <button
              onClick={closeForm}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-gold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
              <input
                type="text"
                value={formData.brand}
                onChange={e => setFormData({ ...formData, brand: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio (COP) *</label>
              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-gold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-gold bg-white"
              >
                <option value="">Selecciona...</option>
                <option value="sol">Sol</option>
                <option value="lectura">Lectura</option>
                <option value="contacto">Contacto</option>
                <option value="deportiva">Deportiva</option>
                <option value="infantil">Infantil</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary-gold resize-none"
              />
            </div>

            {/* Preview imagen actual en modo edición */}
            {mode === 'edit' && formData.image_url && !formData.imageFile && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen actual
                </label>
                <img
                  src={formData.image_url}
                  alt="Imagen actual"
                  className="w-32 h-32 object-cover rounded-xl border border-gray-200"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Selecciona una nueva imagen para reemplazarla, o déjala así.
                </p>
              </div>
            )}

            <div className="md:col-span-2">
              <AdminProductImgUpload
                onImageChange={(file) => setFormData(prev => ({ ...prev, imageFile: file }))}
                initialImage=""
              />
            </div>

            <div className="md:col-span-2 flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary-purple hover:bg-primary-gold disabled:bg-gray-400 text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                {saving
                  ? <><Loader2 size={20} className="animate-spin" /> Guardando...</>
                  : <><Save size={20} /> {mode === 'edit' ? 'Guardar cambios' : 'Crear producto'}</>
                }
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="flex-1 border border-gray-300 hover:bg-gray-100 py-4 rounded-xl font-bold transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tabla de productos ──────────────────────── */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 size={36} className="animate-spin text-primary-purple" />
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-primary-purple text-white">
                <tr>
                  <th className="p-4 text-left">Imagen</th>
                  <th className="p-4 text-left">Producto</th>
                  <th className="p-4 text-left">Categoría</th>
                  <th className="p-4 text-left">Precio</th>
                  <th className="p-4 text-left">Stock</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr
                    key={product.id}
                    className={`border-b hover:bg-gray-50 transition ${
                      editingId === product.id ? 'bg-yellow-50 border-l-4 border-l-primary-gold' : ''
                    }`}
                  >
                    <td className="p-4">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-14 h-14 object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=100&q=40';
                        }}
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800">{product.name}</div>
                      <div className="text-sm text-gray-400">{product.brand}</div>
                    </td>
                    <td className="p-4 capitalize">
                      <span className="bg-purple-100 text-primary-purple text-xs font-semibold px-3 py-1 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-primary-gold">
                      ${product.price.toLocaleString('es-CO')}
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {product.stock === 0 ? 'Agotado' : product.stock}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openEdit(product)}
                        title="Editar"
                        className="text-primary-purple hover:text-primary-gold mr-4 transition"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        title="Eliminar"
                        className="text-red-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="p-10 text-center text-gray-500 text-lg">
            No hay productos registrados. ¡Agrega el primero!
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
