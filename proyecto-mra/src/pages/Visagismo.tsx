import { useState } from 'react';
import { ChevronRight, CheckCircle2, RefreshCw } from 'lucide-react';

type FaceShape = 'oval' | 'redondo' | 'cuadrado' | 'corazon' | 'rectangular' | 'diamante';

interface FrameRecommendation {
  tipo: string;
  descripcion: string;
  ejemplo: string;
  evitar: string;
}

const FACE_SHAPES: {
  id: FaceShape;
  label: string;
  description: string;
  svgPath: string;
}[] = [
  {
    id: 'oval',
    label: 'Ovalado',
    description: 'Frente ligeramente más ancha, pómulos prominentes.',
    svgPath: 'M50 15 C75 15, 90 30, 90 50 C90 72, 75 88, 50 90 C25 88, 10 72, 10 50 C10 30, 25 15, 50 15Z',
  },
  {
    id: 'redondo',
    label: 'Redondo',
    description: 'Ancho y largo similares, mandíbula suave.',
    svgPath: 'M50 10 C76 10, 90 28, 90 50 C90 72, 76 90, 50 90 C24 90, 10 72, 10 50 C10 28, 24 10, 50 10Z',
  },
  {
    id: 'cuadrado',
    label: 'Cuadrado',
    description: 'Frente ancha, mandíbula fuerte y ángulos marcados.',
    svgPath: 'M18 12 L82 12 L88 22 L88 78 L82 88 L18 88 L12 78 L12 22Z',
  },
  {
    id: 'corazon',
    label: 'Corazón',
    description: 'Frente amplia que se estrecha a barbilla puntiaguda.',
    svgPath: 'M50 88 C50 88, 12 60, 12 36 C12 20, 24 12, 36 15 C42 17, 47 22, 50 27 C53 22, 58 17, 64 15 C76 12, 88 20, 88 36 C88 60, 50 88, 50 88Z',
  },
  {
    id: 'rectangular',
    label: 'Rectangular',
    description: 'Más largo que ancho, frente y mandíbula similares.',
    svgPath: 'M20 10 L80 10 L85 20 L85 80 L80 90 L20 90 L15 80 L15 20Z',
  },
  {
    id: 'diamante',
    label: 'Diamante',
    description: 'Pómulos anchos, frente estrecha y barbilla angosta.',
    svgPath: 'M50 10 L82 42 L50 90 L18 42Z',
  },
];

const RECOMMENDATIONS: Record<FaceShape, FrameRecommendation> = {
  oval: {
    tipo: 'Casi cualquier montura te queda bien',
    descripcion:
      'El rostro ovalado es el más versátil. Tus proporciones equilibradas permiten lucir casi cualquier forma de montura sin perder armonía. Tienes total libertad para experimentar con estilos.',
    ejemplo: 'Cuadradas, mariposa, cat-eye, aviador, redondas clásicas.',
    evitar: 'Marcos demasiado grandes que oculten tus rasgos faciales.',
  },
  redondo: {
    tipo: 'Marcos angulares y rectangulares',
    descripcion:
      'Para alargar y estilizar el rostro redondo, elige monturas que añadan definición y estructura. Los marcos con líneas rectas crean un contraste perfecto con las curvas suaves de tu cara.',
    ejemplo: 'Rectangulares, cuadradas, cat-eye, mariposa con ángulos marcados.',
    evitar: 'Marcos redondos o muy pequeños que acentúen la redondez del rostro.',
  },
  cuadrado: {
    tipo: 'Marcos redondeados y ovalados',
    descripcion:
      'Suaviza los ángulos fuertes de tu mandíbula con monturas curvas. Las formas redondas y ovaladas equilibran la estructura cuadrada y dan un aspecto más delicado y armonioso.',
    ejemplo: 'Redondas, ovaladas, aviador, cat-eye con extremos curvos.',
    evitar: 'Marcos cuadrados o angulares que dupliquen la estructura de tu cara.',
  },
  corazon: {
    tipo: 'Marcos más anchos en la parte inferior',
    descripcion:
      'Equilibra tu frente amplia con monturas que añadan volumen en la parte baja. Los marcos sin montura superior o con base ancha funcionan a la perfección para este tipo de rostro.',
    ejemplo: 'Ovaladas anchas en la base, redondas, semi-rimless, mariposa invertida.',
    evitar: 'Cat-eye y marcos anchos en la parte superior que enfaticen la frente.',
  },
  rectangular: {
    tipo: 'Marcos grandes y redondeados',
    descripcion:
      'Añade anchura y equilibrio con monturas amplias. Las formas redondeadas y los marcos oversized rompen la verticalidad del rostro y lo hacen ver más armonioso y proporcional.',
    ejemplo: 'Redondas grandes, cuadradas anchas, aviador grande, mariposa.',
    evitar: 'Marcos estrechos o pequeños que alarguen aún más el rostro.',
  },
  diamante: {
    tipo: 'Marcos que suavicen los pómulos',
    descripcion:
      'Tus pómulos prominentes son tu rasgo más distinctive. Elige monturas que equilibren la frente y la barbilla para crear armonía. El cat-eye y las ovaladas son tus mejores aliados.',
    ejemplo: 'Cat-eye, ovaladas, semi-rimless en la parte superior.',
    evitar: 'Marcos estrechos o rectangulares que resalten en exceso el ancho de los pómulos.',
  },
};

const FaceShapeCard = ({
  shape,
  selected,
  onClick,
}: {
  shape: (typeof FACE_SHAPES)[0];
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer
      ${selected
        ? 'border-primary-gold bg-amber-50 shadow-lg scale-105'
        : 'border-gray-200 bg-white hover:border-primary-purple hover:shadow-md'
      }`}
  >
    {selected && (
      <CheckCircle2 size={20} className="absolute top-2 right-2 text-primary-gold" fill="#D4AF37" />
    )}

    <svg viewBox="0 0 100 100" width={68} height={68}>
      <path
        d={shape.svgPath}
        fill={selected ? '#6B21A8' : '#E5E7EB'}
        stroke={selected ? '#D4AF37' : '#9CA3AF'}
        strokeWidth="2"
        className="transition-colors duration-200"
      />
      <ellipse cx="36" cy="46" rx="5" ry="3.5" fill={selected ? '#D4AF37' : '#fff'} />
      <ellipse cx="64" cy="46" rx="5" ry="3.5" fill={selected ? '#D4AF37' : '#fff'} />
      <path
        d="M50 52 C48 56, 46 60, 47 62 C49 64, 53 64, 53 62 C54 60, 52 56, 50 52Z"
        fill={selected ? '#D4AF37' : '#9CA3AF'}
      />
      <path
        d="M42 70 Q50 75 58 70"
        stroke={selected ? '#D4AF37' : '#9CA3AF'}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>

    <span className={`font-semibold text-sm ${selected ? 'text-primary-purple' : 'text-gray-700'}`}>
      {shape.label}
    </span>
    <span className="text-xs text-gray-500 text-center leading-snug">{shape.description}</span>
  </button>
);

const Visagismo = () => {
  const [selectedShape, setSelectedShape] = useState<FaceShape | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (selectedShape) setConfirmed(true);
  };

  const handleReset = () => {
    setSelectedShape(null);
    setConfirmed(false);
  };

  const shapeData = selectedShape ? FACE_SHAPES.find((s) => s.id === selectedShape)! : null;
  const rec = selectedShape ? RECOMMENDATIONS[selectedShape] : null;

  return (
    <div className="min-h-screen bg-neutral-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-purple mb-3">
            Visagismo Virtual
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubre qué montura es ideal para ti según la forma de tu rostro.
          </p>
        </div>

        {!confirmed ? (
          <>
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
              <h2 className="text-xl font-bold text-primary-purple mb-1">
                ¿Cuál es la forma de tu rostro?
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Selecciona la opción que más se parezca a la forma general de tu cara.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {FACE_SHAPES.map((shape) => (
                  <FaceShapeCard
                    key={shape.id}
                    shape={shape}
                    selected={selectedShape === shape.id}
                    onClick={() => setSelectedShape(shape.id)}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={!selectedShape}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3
                ${selectedShape
                  ? 'bg-primary-purple hover:bg-purple-900 text-white shadow-lg hover:-translate-y-0.5'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              Ver mi recomendación
              <ChevronRight size={22} />
            </button>

            {/* Tip */}
            <div className="mt-8 bg-primary-purple/5 border border-primary-purple/20 rounded-2xl p-5">
              <h3 className="font-semibold text-primary-purple mb-2 text-sm uppercase tracking-wide">
                💡 ¿Cómo identificar mi forma de rostro?
              </h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Recoge el cabello hacia atrás y mira tu rostro de frente al espejo.</li>
                <li>Observa si tu frente, pómulos y mandíbula son similares en ancho.</li>
                <li>Fíjate si tu barbilla es redondeada, angulosa o puntiaguda.</li>
                <li>Compara el largo total de tu cara con su ancho.</li>
              </ul>
            </div>
          </>
        ) : (
          shapeData && rec && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              {/* Header resultado */}
              <div className="bg-primary-purple px-8 py-6 flex items-center gap-5">
                <svg viewBox="0 0 100 100" width={64} height={64} className="shrink-0">
                  <path d={shapeData.svgPath} fill="#D4AF37" opacity="0.25" />
                  <path d={shapeData.svgPath} fill="none" stroke="#D4AF37" strokeWidth="3" />
                </svg>
                <div>
                  <p className="text-primary-gold text-sm font-medium uppercase tracking-wider">
                    Rostro {shapeData.label}
                  </p>
                  <h2 className="text-white text-2xl font-bold mt-1">{rec.tipo}</h2>
                </div>
              </div>

              {/* Cuerpo */}
              <div className="p-8 space-y-6">
                <p className="text-gray-700 text-base leading-relaxed">{rec.descripcion}</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-green-800 text-sm uppercase tracking-wide">
                        Te recomendamos
                      </h3>
                    </div>
                    <p className="text-green-700 text-sm leading-relaxed">{rec.ejemplo}</p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-red-800 text-sm uppercase tracking-wide">
                        Mejor evitar
                      </h3>
                    </div>
                    <p className="text-red-700 text-sm leading-relaxed">{rec.evitar}</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-primary-gold/10 border border-primary-gold/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-primary-purple">¿Listo para elegir tus gafas?</p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Aplica este consejo al explorar nuestro catálogo.
                    </p>
                  </div>
                  <a
                    href="/"
                    className="shrink-0 bg-primary-purple hover:bg-purple-900 text-white px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2"
                  >
                    Ver catálogo
                    <ChevronRight size={16} />
                  </a>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-primary-purple py-3 rounded-xl border border-gray-200 hover:border-primary-purple transition text-sm font-medium"
                >
                  <RefreshCw size={16} />
                  Volver a elegir forma de rostro
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Visagismo;