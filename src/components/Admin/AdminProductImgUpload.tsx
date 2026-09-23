import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminProductImageUploadProps {
  onImageChange: (file: File | null) => void; // callback para enviar la imagen al padre
  initialImage?: string; // URL de imagen existente (para edición)
}

const AdminProductImageUpload = ({ onImageChange, initialImage }: AdminProductImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file?: File) => {
    if (!file) return;

    // Validaciones básicas
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast.error('La imagen es muy grande (máximo 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      onImageChange(file);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageChange(null);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Foto del producto</label>

      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragActive 
            ? 'border-primary-gold bg-primary-gold/10' 
            : 'border-gray-300 hover:border-primary-gold hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-xl object-contain shadow-md"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <>
            <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Arrastra y suelta una imagen aquí
            </p>
            <p className="text-sm text-gray-500 mb-4">o</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary-purple hover:bg-primary-gold text-white px-6 py-3 rounded-xl font-medium transition flex items-center gap-2 mx-auto"
            >
              <Upload size={20} />
              Seleccionar foto
            </button>
          </>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files?.[0])}
          ref={fileInputRef}
          className="hidden"
        />
      </div>

      <p className="text-xs text-gray-500 text-center">
        Formatos recomendados: JPG, PNG. Tamaño máximo: 5MB
      </p>
    </div>
  );
};

export default AdminProductImageUpload;