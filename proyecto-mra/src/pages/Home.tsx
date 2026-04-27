// Practicamente el index
import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Shield, Truck, Headphones, Eye } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import type { Product } from '../types/product';

type CategoryFilter = 'todos' | Product['category'];

const CATEGORIES: { label: string; value: CategoryFilter; }[] = [
  { label: 'Todos',     value: 'todos',     },
  { label: 'Sol',       value: 'sol',       },
  { label: 'Lectura',   value: 'lectura',   },
  { label: 'Contacto',  value: 'contacto',  },
  { label: 'Infantil',  value: 'infantil',  },
  { label: 'Deportiva', value: 'deportiva', },
];

// Carrusel

const SLIDES = [
  {
    img: 'https://i.ibb.co/8LHt3dyQ/img-ppal-MRA.png"',
    title: 'Óptica MRA',
    subtitle: 'Tu visión, nuestra pasión desde Rionegro, Antioquia',
    cta: 'Ver Colección',
    href: '#catalogo',
  },
  {
    img: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=2000&q=80',
    title: 'Nuevas Monturas 2025',
    subtitle: 'Diseños exclusivos para cada personalidad y estilo de vida',
    cta: 'Descubrir',
    href: '#catalogo',
  },
  {
    img: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=2000&q=80',
    title: 'Lentes de Contacto',
    subtitle: 'Comodidad y claridad visual para todo el día',
    cta: 'Ver lentes',
    href: '#catalogo',
  },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const prev = () => { setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length); resetTimer(); };
  const next = () => { setCurrent(c => (c + 1) % SLIDES.length); resetTimer(); };

  return (
    <div className="relative h-[70vh] md:h-[82vh] overflow-hidden group">
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          style={{ backgroundImage: `url('${slide.img}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <div className="text-center text-white px-6 max-w-4xl">
              <h1 className="text-5xl md:text-7xl font-bold mb-5 drop-shadow-lg">{slide.title}</h1>
              <p className="text-xl md:text-2xl mb-10 drop-shadow-md text-gray-200">{slide.subtitle}</p>
              <a
                href={slide.href}
                className="inline-block bg-primary-gold hover:bg-yellow-400 text-primary-purple px-10 py-4 rounded-full text-lg font-bold transition transform hover:scale-105 shadow-xl"
              >
                {slide.cta}
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* Flechitas de navegacion */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={28} />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); resetTimer(); }}
            className={`rounded-full transition-all duration-300 ${i === current ? 'bg-primary-gold w-8 h-3' : 'bg-white/50 w-3 h-3'}`}
          />
        ))}
      </div>
    </div>
  );
};

// Beneficios 

const BENEFITS = [
  { icon: Shield,     title: 'Garantía de Calidad',    desc: 'Todos nuestros productos cuentan con garantía y son de marcas certificadas.' },
  { icon: Eye,        title: 'Asesoría Personalizada', desc: 'Nuestros expertos te ayudan a encontrar la montura ideal para tu rostro.' },
  { icon: Truck,      title: 'Envío a Todo el País',   desc: 'Entregamos en toda Colombia con seguimiento en tiempo real.' },
  { icon: Headphones, title: 'Soporte 24/7',           desc: 'Estamos disponibles para resolver cualquier duda sobre tu pedido.' },
];

const BenefitsSection = () => (
  <section className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {BENEFITS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center text-center p-6 rounded-2xl hover:shadow-lg transition group">
            <div className="w-16 h-16 bg-primary-purple/10 group-hover:bg-primary-purple rounded-2xl flex items-center justify-center mb-4 transition">
              <Icon size={30} className="text-primary-purple group-hover:text-white transition" />
            </div>
            <h3 className="font-bold text-primary-purple text-lg mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Banner Citas

const CitasBanner = () => (
  <section className="py-16 px-6 bg-white">
    <div className="max-w-5xl mx-auto">
      <div className="bg-gradient-to-br from-primary-purple to-purple-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📅</span>
            <span className="bg-primary-gold/20 text-primary-gold text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Agendamiento online</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Agenda tu cita en menos de 2 minutos
          </h2>
          <p className="text-purple-200 text-lg">
            Examen visual, adaptación de lentes, recogida de pedido o asesoría de monturas. Sin filas, sin esperas.
          </p>
          <div className="flex flex-wrap gap-3 mt-1">
            {['👁️ Examen visual','🔬 Lentes de contacto','🕶️ Asesoría de monturas','📦 Recogida de pedido'].map(s => (
              <span key={s} className="bg-white/10 text-purple-100 text-xs px-3 py-1.5 rounded-full">{s}</span>
            ))}
          </div>
        </div>
        <Link
          to="/citas"
          className="shrink-0 bg-primary-gold hover:bg-yellow-400 text-primary-purple px-10 py-5 rounded-2xl font-bold text-lg transition transform hover:scale-105 shadow-xl whitespace-nowrap"
        >
          Agendar ahora →
        </Link>
      </div>
    </div>
  </section>
);

// Banner Visagismo 

const VisagismoBanner = () => (
  <section className="py-16 px-6 bg-primary-purple">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
      <div className="text-6xl">🕶️</div>
      <div className="flex-1">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          ¿No sabes qué forma de gafa te queda?
        </h2>
        <p className="text-purple-200 text-lg">
          Usa nuestro recomendador de visagismo y descubre la montura perfecta para la forma de tu rostro.
        </p>
      </div>
      <Link
        to="/visagismo"
        className="shrink-0 bg-primary-gold hover:bg-yellow-400 text-primary-purple px-8 py-4 rounded-full font-bold text-lg transition transform hover:scale-105 shadow-xl"
      >
        Probar ahora
      </Link>
    </div>
  </section>
);

// Testimonios

const TESTIMONIALS = [
  { name: 'María Fernanda L.', city: 'Medellín', rating: 5, text: 'Excelente atención. Me ayudaron a elegir unas gafas que se adaptan perfecto a mi cara y llegan rapidísimo.' },
  { name: 'Carlos Andrés R.',  city: 'Rionegro',  rating: 5, text: 'Los lentes de contacto que pedí llegaron en dos días. Muy buena calidad y precio justo. Totalmente recomendados.' },
  { name: 'Valentina G.',      city: 'Bogotá',    rating: 5, text: 'El visagismo virtual me sorprendió mucho. Encontré el modelo ideal sin salir de casa. ¡Gracias Óptica MRA!' },
];

const TestimonialsSection = () => (
  <section className="py-16 bg-neutral-light px-6">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-primary-purple text-center mb-3">
        Lo que dicen nuestros clientes
      </h2>
      <p className="text-center text-gray-500 mb-12">Más de 500 clientes satisfechos en toda Colombia</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map(({ name, city, rating, text }) => (
          <div key={name} className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
            <div className="flex gap-1">
              {Array.from({ length: rating }).map((_, i) => (
                <Star key={i} size={18} className="text-primary-gold fill-primary-gold" />
              ))}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed flex-1">"{text}"</p>
            <div>
              <p className="font-bold text-primary-purple text-sm">{name}</p>
              <p className="text-xs text-gray-400">{city}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Pagina principal

const Home = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('todos');
  const { products, loading, error } = useProducts();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search')?.toLowerCase() ?? '';

  const filtered = products
    .filter(p => activeCategory === 'todos' || p.category === activeCategory)
    .filter(p => {
      if (!searchQuery) return true;
      return (
        p.name.toLowerCase().includes(searchQuery) ||
        p.brand.toLowerCase().includes(searchQuery) ||
        p.description?.toLowerCase().includes(searchQuery)
      );
    });

  return (
    <div className="min-h-screen">
      {/* Carrusel hero */}
      <HeroCarousel />

      {/* Beneficios */}
      <BenefitsSection />

      {/* Banner citas */}
      <CitasBanner />

      {searchQuery && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para{' '}
            <span className="font-semibold text-primary-purple">"{searchQuery}"</span>
          </p>
          <a href="/" className="text-sm text-gray-400 hover:text-primary-purple transition">
            Limpiar búsqueda
          </a>
        </div>
      )}

      {/* Catálogo */}
      <section id="catalogo" className="py-16 px-6 md:px-10 bg-neutral-light">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-purple text-center mb-3">
            Nuestras Colecciones
          </h2>
          <p className="text-center text-gray-500 text-lg mb-12 max-w-2xl mx-auto">
            Encuentra el par perfecto para cada ocasión y estilo de vida
          </p>

          {/* Filtros */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {CATEGORIES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setActiveCategory(value)}
                className={`px-5 py-2.5 rounded-full border font-medium transition flex items-center gap-2
                  ${activeCategory === value
                    ? 'bg-primary-purple text-white border-primary-purple shadow-lg'
                    : 'bg-white border-gray-300 hover:border-primary-purple hover:text-primary-purple'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-10 text-lg">
              Error al cargar productos: {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {filtered.length === 0 ? (
                <p className="text-center text-gray-500 text-lg py-10">
                  No hay productos en esta categoría aún.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {filtered.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Banner visagismo */}
      <VisagismoBanner />

      {/* Testimonios */}
      <TestimonialsSection />
    </div>
  );
};

export default Home;