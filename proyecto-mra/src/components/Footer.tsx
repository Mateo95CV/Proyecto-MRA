import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, Clock } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-purple text-white">
      {/* Cuerpo del footer */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Columna 1 – Marca */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-primary-gold">Óptica MRA</h2>
          <p className="text-purple-200 text-sm leading-relaxed">
            Tu óptica de confianza en Rionegro, Antioquia. Salud visual de calidad con atención personalizada.
          </p>
          <div className="flex gap-4 mt-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary-gold hover:text-primary-purple flex items-center justify-center transition"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://facebook.com/Mraoptespecializada04"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary-gold hover:text-primary-purple flex items-center justify-center transition"
              aria-label="Facebook"
            >
              <Facebook size={18} />
            </a>
          </div>
        </div>

        {/* Columna 2 – Navegación */}
        <div className="flex flex-col gap-3">
          <h3 className="text-primary-gold font-semibold uppercase tracking-wider text-sm mb-1">
            Navegar
          </h3>
          {[
            { label: 'Inicio',            to: '/'          },
            { label: 'Mi perfil',         to: '/perfil'    },
            { label: 'Carrito',           to: '/carrito'   },
            { label: 'Visagismo Virtual', to: '/visagismo' },
          ].map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="text-purple-200 hover:text-primary-gold text-sm transition"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Columna 3 – Horario */}
        <div className="flex flex-col gap-3">
          <h3 className="text-primary-gold font-semibold uppercase tracking-wider text-sm mb-1">
            Horario
          </h3>
          <div className="flex items-start gap-2 text-purple-200 text-sm">
            <Clock size={16} className="mt-0.5 shrink-0 text-primary-gold" />
            <div>
              <p className="font-medium text-white">Lunes – Viernes</p>
              <p>8:00 a.m. – 6:00 p.m.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-purple-200 text-sm">
            <Clock size={16} className="mt-0.5 shrink-0 text-primary-gold" />
            <div>
              <p className="font-medium text-white">Sábados</p>
              <p>9:00 a.m. – 2:00 p.m.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-purple-200 text-sm">
            <Clock size={16} className="mt-0.5 shrink-0 text-primary-gold" />
            <div>
              <p className="font-medium text-white">Domingos</p>
              <p>Cerrado</p>
            </div>
          </div>
        </div>

        {/* Columna 4 – Contacto */}
        <div className="flex flex-col gap-3">
          <h3 className="text-primary-gold font-semibold uppercase tracking-wider text-sm mb-1">
            Contacto
          </h3>
          <a
            href="https://maps.app.goo.gl/ENjrECQt1H3Bhu3f7"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 text-purple-200 hover:text-primary-gold text-sm transition"
          >
            <MapPin size={16} className="mt-0.5 shrink-0 text-primary-gold" />
            Calle 59 #47-42, Barrio los lagos, Rionegro, Antioquia
          </a>
          <a
            href="https://wa.me/+573146030432"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-purple-200 hover:text-primary-gold text-sm transition"
          >
            <Phone size={16} className="shrink-0 text-primary-gold" />
            +57 314 603 0432
          </a>
          <a
            href="mailto:contacto@opticamra.com"
            className="flex items-center gap-2 text-purple-200 hover:text-primary-gold text-sm transition"
          >
            <Mail size={16} className="shrink-0 text-primary-gold" />
            especialistaoptmra04@gmail.com
          </a>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-purple-300">
          <span>© {year} Óptica MRA. Todos los derechos reservados.</span>
          <span>Hecho en Rionegro, Antioquia</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;