import { ShoppingBag, Search, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';
import LogoutModal from './LogoutModal';

const NAV_LINKS = [
  { label: 'Monturas',  to: '/monturas'  },
  { label: 'Visagismo', to: '/visagismo' },
  { label: 'Citas',     to: '/citas'     },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Cierra el menú móvil al cambiar de página
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/monturas?q=${encodeURIComponent(q)}` : '/monturas');
    setMenuOpen(false);
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-1 text-[15px] font-medium transition-colors ${
      isActive
        ? 'text-primary-purple after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-px after:bg-primary-gold'
        : 'text-ink/75 hover:text-primary-purple'
    }`;

  const searchForm = (
    <form onSubmit={handleSearch} role="search" className="relative w-full">
      <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none" />
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Buscar monturas, marcas…"
        aria-label="Buscar productos"
        className="w-full bg-neutral-light border border-line rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary-purple focus:bg-white transition"
      />
    </form>
  );

  return (
    <>
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      <header className="bg-white/95 backdrop-blur border-b border-line sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center gap-6">

          {/* Marca */}
          <Link to="/" className="flex items-baseline gap-2 shrink-0" aria-label="Óptica MRA, inicio">
            <span className="font-display text-[30px] font-semibold leading-none text-ink tracking-wide">MRA</span>
            <span className="hidden sm:inline text-[13px] font-semibold text-gold-deep leading-none">Óptica</span>
          </Link>

          {/* Enlaces */}
          <nav aria-label="Principal" className="hidden md:flex items-center gap-7 ml-4">
            {NAV_LINKS.map(l => (
              <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>
            ))}
          </nav>

          <div className="hidden lg:block flex-1 max-w-sm ml-auto">{searchForm}</div>

          {/* Acciones */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto lg:ml-0">
            <Link
              to="/carrito"
              className="relative p-2.5 rounded-full text-ink hover:bg-neutral-light transition"
              aria-label={`Carrito, ${itemCount} productos`}
            >
              <ShoppingBag size={22} />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary-purple text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="hidden sm:flex p-2.5 rounded-full text-ink hover:bg-neutral-light transition"
                aria-label="Panel de administración"
                title="Panel de administración"
              >
                <LayoutDashboard size={21} />
              </Link>
            )}

            {user ? (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  to="/perfil"
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-neutral-light transition"
                >
                  <span className="w-8 h-8 rounded-full bg-primary-purple text-white text-sm font-semibold flex items-center justify-center">
                    {user.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                  <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="p-2.5 rounded-full text-ink/60 hover:text-primary-purple hover:bg-neutral-light transition"
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                >
                  <LogOut size={19} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex bg-primary-purple hover:bg-plum text-white text-sm font-semibold px-5 py-2.5 rounded-full transition"
              >
                Ingresar
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(o => !o)}
              className="md:hidden p-2.5 rounded-full text-ink hover:bg-neutral-light transition"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Búsqueda en tablet */}
        <div className="hidden md:block lg:hidden px-6 pb-3">{searchForm}</div>

        {/* Menú móvil */}
        {menuOpen && (
          <div className="md:hidden border-t border-line bg-white px-4 pb-6 pt-4 space-y-4">
            {searchForm}
            <nav aria-label="Principal móvil" className="flex flex-col">
              {NAV_LINKS.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `py-3 border-b border-line font-display text-2xl ${isActive ? 'text-primary-purple' : 'text-ink'}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
            {user ? (
              <div className="flex gap-3">
                <Link to="/perfil" className="flex-1 text-center border border-line rounded-full py-3 text-sm font-semibold">
                  Mi perfil
                </Link>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex-1 border border-line rounded-full py-3 text-sm font-semibold text-ink/70"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link to="/login" className="block text-center bg-primary-purple text-white rounded-full py-3 text-sm font-semibold">
                Ingresar
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
