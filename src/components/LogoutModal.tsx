import { LogOut, X } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutModal = ({ isOpen, onConfirm, onCancel }: LogoutModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Botón X */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Cancelar"
        >
          <X size={20} />
        </button>

        {/* Icono */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <LogOut size={28} className="text-red-500" />
        </div>

        {/* Texto */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-1">¿Cerrar sesión?</h2>
          <p className="text-gray-500 text-sm">
            Se cerrará tu sesión en este dispositivo. Podrás volver a ingresar cuando quieras.
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 w-full mt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold transition text-sm flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;