import { useState } from 'react';
import { ArrowRight, RefreshCw, Shield, Check, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import FaceShapeIcon from '../components/FaceShapeIcon';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import {
  FACE_SHAPES,
  RECOMMENDATIONS,
  frameShapeLabel,
  isFaceShape,
  type FaceShape,
} from '../data/visagismo';

const MAX_SUGGESTED = 4;

const Visagismo = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rostroParam = searchParams.get('rostro');
  // El resultado confirmado vive en la URL (?rostro=oval) para poder compartirlo o llegar desde el Home
  const confirmed = isFaceShape(rostroParam) ? rostroParam : null;
  const [selected, setSelected] = useState<FaceShape | null>(confirmed);

  const { products, loading } = useProducts();

  const handleConfirm = () => {
    if (selected) {
      setSearchParams({ rostro: selected });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setSelected(null);
    setSearchParams({});
  };

  const shapeData = confirmed ? FACE_SHAPES.find(s => s.id === confirmed)! : null;
  const rec = confirmed ? RECOMMENDATIONS[confirmed] : null;
  const suggested = rec
    ? products.filter(p => p.frame_shape && rec.recomendadas.includes(p.frame_shape)).slice(0, MAX_SUGGESTED)
    : [];

  return (
    <main className="min-h-screen bg-white">
      {/* Encabezado */}
      <div className="border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-10">
          <h1 className="text-5xl md:text-6xl font-semibold">Visagismo</h1>
          <p className="text-ink/65 text-lg mt-3 max-w-2xl">
            La forma de tu rostro dice mucho sobre la montura que mejor te queda.
            Elige la tuya y te mostramos qué buscar y qué evitar.
          </p>
          <p className="flex items-start gap-2 mt-5 text-sm text-ink/60">
            <Shield size={16} className="shrink-0 mt-0.5 text-primary-purple" />
            <span>
              No usamos ni guardamos fotos de tu rostro.{' '}
              <Link to="/politica-privacidad" className="font-semibold text-primary-purple underline underline-offset-2">
                Ver política de privacidad
              </Link>
            </span>
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {!confirmed ? (
          <>
            <fieldset>
              <legend className="font-display text-3xl font-semibold mb-1">¿Cuál es la forma de tu rostro?</legend>
              <p className="text-ink/60 text-sm mb-6">
                Selecciona la opción que más se parezca a la forma general de tu cara.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {FACE_SHAPES.map(shape => {
                  const isSelected = selected === shape.id;
                  return (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => setSelected(shape.id)}
                      aria-pressed={isSelected}
                      className={`relative flex flex-col items-center text-center gap-2 p-5 rounded-2xl border transition
                        ${isSelected
                          ? 'border-primary-purple bg-primary-purple/5 ring-1 ring-primary-purple'
                          : 'border-line hover:border-ink/30'
                        }`}
                    >
                      {isSelected && (
                        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-purple text-white flex items-center justify-center">
                          <Check size={13} strokeWidth={3} />
                        </span>
                      )}
                      <FaceShapeIcon
                        path={shape.svgPath}
                        size={72}
                        className={isSelected ? 'text-primary-purple' : 'text-ink/45'}
                      />
                      <span className="font-semibold">{shape.label}</span>
                      <span className="text-xs text-ink/55 leading-snug">{shape.description}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <button
              onClick={handleConfirm}
              disabled={!selected}
              className="mt-6 w-full sm:w-auto sm:px-10 py-4 rounded-full font-semibold transition flex items-center justify-center gap-2
                bg-primary-purple hover:bg-plum text-white disabled:bg-line disabled:text-ink/40 disabled:cursor-not-allowed"
            >
              Ver mi recomendación
              <ArrowRight size={18} />
            </button>

            {/* Guía */}
            <section className="mt-14 grid md:grid-cols-[1fr_2fr] gap-6 border-t border-line pt-10">
              <h2 className="text-3xl font-semibold">¿Cómo identifico mi forma de rostro?</h2>
              <ol className="space-y-4">
                {[
                  'Recoge el cabello hacia atrás y mírate de frente al espejo.',
                  'Compara el ancho de tu frente, tus pómulos y tu mandíbula.',
                  'Fíjate si tu barbilla es redondeada, angulosa o fina.',
                  'Compara el largo total de tu cara con su ancho.',
                ].map((step, i) => (
                  <li key={step} className="flex gap-4">
                    <span className="font-display text-2xl text-gold-deep leading-none w-5 shrink-0">{i + 1}</span>
                    <span className="text-ink/75">{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          </>
        ) : (
          shapeData && rec && (
            <div>
              {/* Resultado */}
              <section className="bg-plum text-white rounded-3xl p-7 sm:p-10 grid sm:grid-cols-[auto_1fr] gap-6 sm:gap-10 items-center">
                <FaceShapeIcon path={shapeData.svgPath} size={120} className="text-primary-gold" />
                <div>
                  <p className="text-primary-gold text-sm font-semibold">Rostro {shapeData.label.toLowerCase()}</p>
                  <h2 className="text-4xl sm:text-5xl font-semibold mt-1 leading-tight">{rec.tipo}</h2>
                  <p className="text-white/75 mt-4 leading-relaxed max-w-xl">{rec.descripcion}</p>
                </div>
              </section>

              <div className="grid md:grid-cols-2 gap-8 mt-10">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Check size={18} className="text-green-700" /> Te recomendamos
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {rec.recomendadas.map(f => (
                      <li key={f} className="px-3.5 py-1.5 rounded-full bg-green-50 text-green-800 text-sm font-medium border border-green-200">
                        {frameShapeLabel(f)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <X size={18} className="text-red-700" /> Mejor evitar
                  </h3>
                  <p className="text-ink/70 leading-relaxed">{rec.evitar}</p>
                </div>
              </div>

              {/* Monturas del catálogo */}
              <section className="mt-14 border-t border-line pt-10">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                  <h2 className="text-3xl md:text-4xl font-semibold">Monturas para ti</h2>
                  <Link
                    to={`/monturas?rostro=${confirmed}`}
                    className="inline-flex items-center gap-2 text-primary-purple font-semibold hover:gap-3 transition-all"
                  >
                    Ver todas las recomendadas <ArrowRight size={18} />
                  </Link>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-2 border-primary-purple border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : suggested.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
                    {suggested.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-neutral-light p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-ink/70 max-w-lg">
                      Aún no tenemos monturas etiquetadas para esta forma en la tienda en línea.
                      En una cita de asesoría te mostramos las opciones disponibles.
                    </p>
                    <Link
                      to="/citas"
                      className="shrink-0 bg-primary-purple hover:bg-plum text-white px-6 py-3 rounded-full font-semibold text-sm transition text-center"
                    >
                      Agendar asesoría
                    </Link>
                  </div>
                )}
              </section>

              <button
                onClick={handleReset}
                className="mt-12 flex items-center gap-2 text-ink/60 hover:text-primary-purple text-sm font-medium transition"
              >
                <RefreshCw size={16} />
                Elegir otra forma de rostro
              </button>
            </div>
          )
        )}
      </div>
    </main>
  );
};

export default Visagismo;
