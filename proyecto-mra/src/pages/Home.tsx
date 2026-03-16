import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[70vh] md:h-[80vh] bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')" }}
      >
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white px-6 max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
              Óptica MRA
            </h1>
            <p className="text-xl md:text-3xl mb-10 drop-shadow-md">
              Tu visión, nuestra pasión desde Rionegro, Antioquia
            </p>
            <button className="bg-primary-gold hover:bg-yellow-500 text-primary-purple px-10 py-5 rounded-full text-xl font-bold transition transform hover:scale-105">
              Ver Colección
            </button>
          </div>
        </div>
      </div>

      {/* Catálogo */}
      <section className="py-16 px-6 md:px-10 bg-neutral-light">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-purple text-center mb-4">
            Nuestras Colecciones
          </h2>
          <p className="text-center text-gray-600 text-lg mb-12 max-w-2xl mx-auto">
            Encuentra el par perfecto para cada ocasión y estilo de vida
          </p>

          {/* Filtros (por ahora visuales) */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {['Todos', 'Sol', 'Lectura', 'Contacto', 'Infantil', 'Deportiva'].map((cat) => (
              <button
                key={cat}
                className="px-6 py-2 rounded-full bg-white border border-gray-300 hover:border-primary-gold hover:text-primary-gold transition font-medium"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid de productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;