// Datos de visagismo compartidos entre Home, Visagismo, Monturas y el admin.

export type FaceShape = 'oval' | 'redondo' | 'cuadrado' | 'corazon' | 'rectangular' | 'diamante';

export type FrameShape =
  | 'rectangular'
  | 'cuadrada'
  | 'redonda'
  | 'ovalada'
  | 'cat-eye'
  | 'aviador'
  | 'mariposa'
  | 'al-aire';

export const FRAME_SHAPES: { id: FrameShape; label: string }[] = [
  { id: 'rectangular', label: 'Rectangular' },
  { id: 'cuadrada',    label: 'Cuadrada' },
  { id: 'redonda',     label: 'Redonda' },
  { id: 'ovalada',     label: 'Ovalada' },
  { id: 'cat-eye',     label: 'Cat-eye' },
  { id: 'aviador',     label: 'Aviador' },
  { id: 'mariposa',    label: 'Mariposa' },
  { id: 'al-aire',     label: 'Al aire / semi-rimless' },
];

export const frameShapeLabel = (id: FrameShape) =>
  FRAME_SHAPES.find(f => f.id === id)?.label ?? id;

export interface FaceShapeInfo {
  id: FaceShape;
  label: string;
  description: string;
  svgPath: string;
}

export const FACE_SHAPES: FaceShapeInfo[] = [
  {
    id: 'oval',
    label: 'Ovalado',
    description: 'Frente ligeramente más ancha, pómulos prominentes.',
    svgPath: 'M50 12 C72 12, 84 30, 84 50 C84 72, 70 90, 50 90 C30 90, 16 72, 16 50 C16 30, 28 12, 50 12Z',
  },
  {
    id: 'redondo',
    label: 'Redondo',
    description: 'Ancho y largo similares, mandíbula suave.',
    svgPath: 'M50 14 C75 14, 88 30, 88 52 C88 74, 74 88, 50 88 C26 88, 12 74, 12 52 C12 30, 25 14, 50 14Z',
  },
  {
    id: 'cuadrado',
    label: 'Cuadrado',
    description: 'Frente ancha, mandíbula fuerte y ángulos marcados.',
    svgPath: 'M20 14 L80 14 L86 24 L86 76 L78 88 L22 88 L14 76 L14 24Z',
  },
  {
    id: 'corazon',
    label: 'Corazón',
    description: 'Frente amplia que se estrecha hacia una barbilla fina.',
    svgPath: 'M50 90 C40 84, 16 64, 14 40 C13 22, 28 12, 50 12 C72 12, 87 22, 86 40 C84 64, 60 84, 50 90Z',
  },
  {
    id: 'rectangular',
    label: 'Rectangular',
    description: 'Más largo que ancho, frente y mandíbula similares.',
    svgPath: 'M24 8 L76 8 L82 18 L82 82 L74 92 L26 92 L18 82 L18 18Z',
  },
  {
    id: 'diamante',
    label: 'Diamante',
    description: 'Pómulos anchos, frente estrecha y barbilla angosta.',
    svgPath: 'M50 8 C60 8, 70 22, 86 44 C76 66, 62 90, 50 92 C38 90, 24 66, 14 44 C30 22, 40 8, 50 8Z',
  },
];

export interface FrameRecommendation {
  tipo: string;
  descripcion: string;
  recomendadas: FrameShape[];
  evitar: string;
}

export const RECOMMENDATIONS: Record<FaceShape, FrameRecommendation> = {
  oval: {
    tipo: 'Casi cualquier montura te queda bien',
    descripcion:
      'El rostro ovalado es el más versátil. Tus proporciones equilibradas permiten lucir casi cualquier forma de montura sin perder armonía, así que puedes experimentar con estilos.',
    recomendadas: ['cuadrada', 'rectangular', 'cat-eye', 'aviador', 'mariposa', 'redonda'],
    evitar: 'Marcos demasiado grandes que oculten tus rasgos.',
  },
  redondo: {
    tipo: 'Marcos angulares y rectangulares',
    descripcion:
      'Para alargar y estilizar el rostro redondo, elige monturas que añadan definición. Las líneas rectas contrastan con las curvas suaves de tu cara.',
    recomendadas: ['rectangular', 'cuadrada', 'cat-eye', 'mariposa'],
    evitar: 'Marcos redondos o muy pequeños que acentúen la redondez.',
  },
  cuadrado: {
    tipo: 'Marcos redondeados y ovalados',
    descripcion:
      'Suaviza los ángulos de tu mandíbula con monturas curvas. Las formas redondas y ovaladas equilibran la estructura y dan un aspecto más armonioso.',
    recomendadas: ['redonda', 'ovalada', 'aviador', 'cat-eye'],
    evitar: 'Marcos cuadrados o angulares que repitan la estructura de tu cara.',
  },
  corazon: {
    tipo: 'Marcos más anchos en la parte inferior',
    descripcion:
      'Equilibra una frente amplia con monturas que den volumen abajo. Los marcos al aire en la parte superior o con base ancha funcionan muy bien.',
    recomendadas: ['ovalada', 'redonda', 'al-aire', 'aviador'],
    evitar: 'Cat-eye y marcos pesados arriba que enfaticen la frente.',
  },
  rectangular: {
    tipo: 'Marcos grandes y redondeados',
    descripcion:
      'Añade anchura con monturas amplias. Las formas redondeadas y los marcos grandes rompen la verticalidad del rostro y lo hacen ver más proporcionado.',
    recomendadas: ['redonda', 'cuadrada', 'aviador', 'mariposa'],
    evitar: 'Marcos estrechos o pequeños que alarguen aún más el rostro.',
  },
  diamante: {
    tipo: 'Marcos que suavicen los pómulos',
    descripcion:
      'Tus pómulos son tu rasgo más marcado. Elige monturas que den presencia a la frente y la barbilla; el cat-eye y las ovaladas son tus mejores aliadas.',
    recomendadas: ['cat-eye', 'ovalada', 'al-aire'],
    evitar: 'Marcos estrechos o rectangulares que resalten el ancho de los pómulos.',
  },
};

export const isFaceShape = (v: string | null): v is FaceShape =>
  !!v && FACE_SHAPES.some(s => s.id === v);
