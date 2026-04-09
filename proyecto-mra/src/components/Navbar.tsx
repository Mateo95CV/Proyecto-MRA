import { ShoppingCart, User, LogIn, LogOut, Glasses } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const handleAuth = () => {
    if (user) {
      logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          {/* <img src="/logo.png" alt="Logo Óptica" className="h-10 w-auto" /> */}
          <span className="text-2xl font-bold text-primary-purple">Óptica MRA</span>
        </Link>

        {/* Buscador */}
        <div className="flex-1 max-w-xl mx-4 sm:mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Busca gafas, lentes de contacto..."
              className="w-full bg-neutral-light border border-gray-300 rounded-full py-3 px-6 pl-12 focus:outline-none focus:border-primary-gold"
            />
            <Glasses className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
          </div>
        </div>

        {/* Acciones derecha */}
        <div className="flex items-center gap-6 sm:gap-8">
          <Link to="/carrito" className="relative hover:text-primary-gold transition">
            <ShoppingCart size={26} />
            {/* Badge de cantidad - por ahora 0 */}
            <span className="absolute -top-1 -right-1 bg-primary-purple text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </span>
          </Link>

          <Link to="/visagismo" className="hover:text-primary-gold transition">
            <Glasses size={26} />
          </Link>

          {/* Perfil / Nombre de usuario */}
          {user ? (
            <Link to="/perfil" className="flex items-center gap-2 hover:text-primary-gold transition">
              <User size={26} />
              <span className="hidden sm:inline font-medium">{user.name}</span>
            </Link>
          ) : (
            <Link to="/login" className="hover:text-primary-gold transition">
              <User size={26} />
            </Link>
          )}

          {/* Botón principal de auth */}
          <button
            onClick={handleAuth}
            className="flex items-center gap-2 bg-primary-purple hover:bg-primary-gold text-white px-5 sm:px-6 py-2.5 rounded-full font-medium transition"
          >
            {user ? (
              <>
                <LogOut size={20} /> Cerrar sesión
              </>
            ) : (
              <>
                <LogIn size={20} /> Iniciar sesión
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;