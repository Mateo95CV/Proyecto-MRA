// Practicamente el index
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Shield, Truck, Headphones, Eye, Stethoscope, Glasses, Package, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import FaceShapeIcon from '../components/FaceShapeIcon';
import { useProducts } from '../hooks/useProducts';
import { FACE_SHAPES } from '../data/visagismo';
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

// Hero: la propuesta y el selector de rostro

const Hero = () => (
  <section className="bg-white border-b border-line">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
      <div className="lg:col-span-7">
        <p className="text-sm font-semibold text-gold-deep mb-5">
          Dra. Marisela Ramos, optometría en Rionegro, Antioquia
        </p>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[0.95] text-ink">
          Una montura pensada para la forma de tu rostro
        </h1>
        <p className="mt-6 text-lg text-ink/70 max-w-xl leading-relaxed">
          Examen visual, lentes formulados y asesoría de visagismo en un mismo lugar.
          Elige tu forma de rostro y te mostramos qué monturas te favorecen.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            to="/monturas"
            className="inline-flex items-center gap-2 bg-primary-purple hover:bg-plum text-white px-7 py-3.5 rounded-full font-semibold transition"
          >
            Ver monturas
          </Link>
          <Link
            to="/citas"
            className="inline-flex items-center gap-2 border border-ink/20 hover:border-primary-purple hover:text-primary-purple px-7 py-3.5 rounded-full font-semibold transition"
          >
            Agendar examen visual
          </Link>
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="bg-plum text-white rounded-3xl p-7 sm:p-9">
          <h2 className="text-3xl font-semibold">¿Qué forma tiene tu rostro?</h2>
          <p className="text-white/65 text-sm mt-2 mb-7">
            Toca la que más se parezca y ve tu recomendación.
          </p>
          <ul className="grid grid-cols-3 gap-2 sm:gap-3">
            {FACE_SHAPES.map(shape => (
              <li key={shape.id}>
                <Link
                  to={`/visagismo?rostro=${shape.id}`}
                  className="flex flex-col items-center gap-2 py-4 rounded-2xl text-primary-gold hover:bg-white/10 focus-visible:bg-white/10 transition"
                >
                  <FaceShapeIcon path={shape.svgPath} size={68} />
                  <span className="text-sm text-white/90">{shape.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/visagismo"
            className="mt-6 flex items-center justify-between border-t border-white/15 pt-5 text-sm text-white/80 hover:text-primary-gold transition"
          >
            ¿No lo tienes claro? Te guiamos paso a paso
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

// Beneficios

const BENEFITS = [
  { icon: Shield,     title: 'Garantía de calidad',    desc: 'Marcas certificadas y productos con garantía.' },
  { icon: Eye,        title: 'Asesoría personalizada', desc: 'Te ayudamos a elegir la montura para tu rostro.' },
  { icon: Truck,      title: 'Envío a todo el país',   desc: 'Entregas en toda Colombia con seguimiento.' },
  { icon: Headphones, title: 'Soporte 24/7',           desc: 'Resolvemos tus dudas sobre cualquier pedido.' },
];

const BenefitsStrip = () => (
  <section aria-label="Beneficios" className="bg-neutral-light">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-8 lg:divide-x lg:divide-line">
      {BENEFITS.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="flex gap-4 lg:px-6 first:lg:pl-0">
          <Icon size={22} className="text-primary-purple shrink-0 mt-0.5" strokeWidth={1.75} />
          <div>
            <h3 className="font-semibold text-[15px]">{title}</h3>
            <p className="text-sm text-ink/60 mt-1 leading-relaxed">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// Catálogo destacado

const MAX_HOME_PRODUCTS = 4;

const FeaturedProducts = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('todos');
  const { products, loading, error } = useProducts();

  const allFiltered = products.filter(p => activeCategory === 'todos' || p.category === activeCategory);
  const filtered = allFiltered.slice(0, MAX_HOME_PRODUCTS);

  return (
    <section id="catalogo" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-semibold">Monturas destacadas</h2>
            <p className="text-ink/60 mt-3 max-w-lg">
              Lo más reciente de nuestra colección, para cada ocasión y estilo de vida.
            </p>
          </div>
          <Link
            to="/monturas"
            className="inline-flex items-center gap-2 text-primary-purple font-semibold hover:gap-3 transition-all shrink-0"
          >
            Ver todo el catálogo <ArrowRight size={18} />
          </Link>
        </div>

        <div className="flex gap-2 mb-10 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {CATEGORIES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveCategory(value)}
              aria-pressed={activeCategory === value}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition
                ${activeCategory === value
                  ? 'bg-ink text-white border-ink'
                  : 'bg-white border-line text-ink/70 hover:border-ink/40 hover:text-ink'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-2 border-primary-purple border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <p className="text-center text-red-600 py-10">No pudimos cargar los productos: {error}</p>
        )}

        {!loading && !error && (
          filtered.length === 0 ? (
            <p className="text-center text-ink/55 py-10">Aún no hay productos en esta categoría.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )
        )}
      </div>
    </section>
  );
};

// Citas

const CITA_SERVICES = [
  { icon: Eye,         label: 'Examen visual completo' },
  { icon: Stethoscope, label: 'Adaptación de lentes de contacto' },
  { icon: Glasses,     label: 'Asesoría de monturas y visagismo' },
  { icon: Package,     label: 'Recogida de tu pedido' },
];

const CitasSection = () => (
  <section className="bg-neutral-light py-16 md:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
      <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-line">
        <img
          src="https://i.ibb.co/Rrzn4fW/img-Yeison1.png"
          alt="Consultorio de Óptica MRA en Rionegro"
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h2 className="text-4xl md:text-5xl font-semibold">Agenda tu cita en menos de dos minutos</h2>
        <p className="text-ink/65 mt-4 text-lg leading-relaxed max-w-lg">
          Elige el servicio, el día y la hora. Sin filas y sin esperas.
        </p>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {CITA_SERVICES.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-4 py-3.5">
              <Icon size={20} className="text-primary-purple" strokeWidth={1.75} />
              <span className="font-medium">{label}</span>
            </li>
          ))}
        </ul>
        <Link
          to="/citas"
          className="mt-8 inline-flex bg-primary-purple hover:bg-plum text-white px-7 py-3.5 rounded-full font-semibold transition"
        >
          Agendar cita
        </Link>
      </div>
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
  <section className="bg-white py-16 md:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl md:text-5xl font-semibold max-w-xl">Lo que dicen nuestros clientes</h2>
      <div className="mt-12 grid md:grid-cols-3 gap-10">
        {TESTIMONIALS.map(({ name, city, rating, text }) => (
          <figure key={name} className="border-t-2 border-primary-gold pt-6 flex flex-col">
            <div className="flex gap-0.5 mb-4" aria-label={`${rating} de 5 estrellas`}>
              {Array.from({ length: rating }).map((_, i) => (
                <Star key={i} size={15} className="text-primary-gold fill-primary-gold" />
              ))}
            </div>
            <blockquote className="font-display text-2xl leading-snug text-ink flex-1">“{text}”</blockquote>
            <figcaption className="mt-5 text-sm">
              <span className="font-semibold">{name}</span>
              <span className="text-ink/50">, {city}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);

// Pagina principal

const Home = () => (
  <main className="min-h-screen">
    <Hero />
    <BenefitsStrip />
    <FeaturedProducts />
    <CitasSection />
    <TestimonialsSection />
  </main>
);

export default Home;
