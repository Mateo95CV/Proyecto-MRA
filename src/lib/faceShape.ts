// Clasificación de la forma del rostro a partir de los puntos de MediaPipe Face Landmarker.
// Todo ocurre en memoria en el navegador: no se guarda ni se envía ninguna imagen.
//
// Cómo funciona:
// 1. Se alinea la cara (eje barbilla → frente vertical) y se mide el ancho del contorno
//    a distintas alturas. Así no depende de puntos sueltos ni de la inclinación.
// 2. Cada forma se define como una desviación respecto a un rostro promedio (BASELINE).
//    Se elige la forma cuyo prototipo queda más cerca de las medidas de la persona.
//
// Calibración: con /visagismo?calibrar=1 se registran medidas de personas reales.
// Si muchos rostros caen en la misma forma, lo primero es ajustar BASELINE al promedio medido.

import type { FaceShape } from '../data/visagismo';

export interface Point { x: number; y: number }

// Contorno de la cara (FACEMESH_FACE_OVAL de MediaPipe), en orden
const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377,
  152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];

const LM = {
  top:       10,  // parte alta de la frente (la malla no llega a la línea del cabello)
  chin:      152,
  cheekL:    234,
  cheekR:    454,
  noseTip:   1,
  eyeOuterL: 33,
  eyeOuterR: 263,
} as const;

// Alturas relativas (0 = barbilla, 1 = parte alta de la frente) donde se mide el ancho
const LEVELS = {
  forehead: 0.85,
  jaw:      0.25,
  chin:     0.1,
  cheekMin: 0.35, // el ancho de pómulos es el máximo entre estas alturas
  cheekMax: 0.7,
};

export interface FaceMetrics {
  /** Largo del rostro / ancho máximo (pómulos) */
  lengthRatio: number;
  /** Ancho de la frente / ancho de pómulos */
  foreheadRatio: number;
  /** Ancho de la mandíbula / ancho de pómulos */
  jawRatio: number;
  /** Ancho cerca de la barbilla / ancho de pómulos */
  chinRatio: number;
}

type MetricKey = keyof FaceMetrics;
const KEYS: MetricKey[] = ['lengthRatio', 'foreheadRatio', 'jawRatio', 'chinRatio'];

/** Rostro promedio. Es el valor más importante para calibrar. */
export const BASELINE: FaceMetrics = {
  lengthRatio:   1.3,
  foreheadRatio: 0.8,
  jawRatio:      0.8,
  chinRatio:     0.45,
};

/** Variación típica entre personas: cuánto “pesa” cada medida en la comparación. */
export const SPREAD: FaceMetrics = {
  lengthRatio:   0.08,
  foreheadRatio: 0.04,
  jawRatio:      0.04,
  chinRatio:     0.04,
};

/** Cómo se aleja cada forma del rostro promedio (en las mismas unidades que las medidas). */
export const PROTOTYPES: Record<FaceShape, Partial<FaceMetrics>> = {
  oval:        {},
  redondo:     { lengthRatio: -0.12, jawRatio: 0.02, chinRatio: 0.04 },
  cuadrado:    { lengthRatio: -0.1, foreheadRatio: 0.03, jawRatio: 0.07, chinRatio: 0.06 },
  rectangular: { lengthRatio: 0.12, foreheadRatio: 0.02, jawRatio: 0.06, chinRatio: 0.05 },
  corazon:     { foreheadRatio: 0.05, jawRatio: -0.06, chinRatio: -0.06 },
  diamante:    { foreheadRatio: -0.07, jawRatio: -0.05, chinRatio: -0.03 },
};

// Calidad mínima de la toma
export const CAPTURE = {
  minFaceWidth: 0.28, // ancho de pómulos / ancho del video
  maxYaw:       0.07, // desplazamiento de la nariz respecto al centro / ancho de pómulos
  maxRollDeg:   6,    // inclinación de la línea de los ojos
};

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Convierte puntos normalizados (0–1) a píxeles para no deformar las proporciones. */
export const toPixels = (landmarks: Point[], width: number, height: number): Point[] =>
  landmarks.map(p => ({ x: p.x * width, y: p.y * height }));

export function computeMetrics(p: Point[]): FaceMetrics {
  // Ejes de la cara: `up` va de la barbilla a la frente, `right` es perpendicular
  const chin = p[LM.chin];
  const L = dist(p[LM.top], chin);
  const up = { x: (p[LM.top].x - chin.x) / L, y: (p[LM.top].y - chin.y) / L };
  const right = { x: -up.y, y: up.x };

  // Contorno en coordenadas de la cara: h = altura relativa (0–1), a = posición lateral
  const contour = FACE_OVAL.map(i => {
    const dx = p[i].x - chin.x;
    const dy = p[i].y - chin.y;
    return { a: dx * right.x + dy * right.y, h: (dx * up.x + dy * up.y) / L };
  });

  // Ancho del contorno a una altura: cruza la línea horizontal con cada tramo del polígono
  const widthAt = (h: number) => {
    const xs: number[] = [];
    for (let i = 0; i < contour.length; i++) {
      const c1 = contour[i];
      const c2 = contour[(i + 1) % contour.length];
      if ((c1.h - h) * (c2.h - h) <= 0 && c1.h !== c2.h) {
        xs.push(c1.a + ((h - c1.h) / (c2.h - c1.h)) * (c2.a - c1.a));
      }
    }
    return xs.length >= 2 ? Math.max(...xs) - Math.min(...xs) : 0;
  };

  let cheek = 0;
  for (let h = LEVELS.cheekMin; h <= LEVELS.cheekMax + 1e-9; h += 0.025) {
    cheek = Math.max(cheek, widthAt(h));
  }

  return {
    lengthRatio:   L / cheek,
    foreheadRatio: widthAt(LEVELS.forehead) / cheek,
    jawRatio:      widthAt(LEVELS.jaw) / cheek,
    chinRatio:     widthAt(LEVELS.chin) / cheek,
  };
}

export type PoseIssue = 'lejos' | 'girado' | 'inclinado' | null;

/** Revisa que el rostro esté de frente, recto y lo bastante cerca para medir bien. */
export function checkPose(p: Point[], videoWidth: number): PoseIssue {
  const cheek = dist(p[LM.cheekL], p[LM.cheekR]);
  if (cheek / videoWidth < CAPTURE.minFaceWidth) return 'lejos';

  const centerX = (p[LM.cheekL].x + p[LM.cheekR].x) / 2;
  if (Math.abs(p[LM.noseTip].x - centerX) / cheek > CAPTURE.maxYaw) return 'girado';

  const eyeL = p[LM.eyeOuterL];
  const eyeR = p[LM.eyeOuterR];
  const rollDeg = Math.abs(Math.atan2(eyeR.y - eyeL.y, eyeR.x - eyeL.x) * 180 / Math.PI);
  if (Math.min(rollDeg, 180 - rollDeg) > CAPTURE.maxRollDeg) return 'inclinado';

  return null;
}

const median = (values: number[]) => {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

/** Combina varias tomas con la mediana para ignorar fotogramas ruidosos. */
export const aggregateMetrics = (samples: FaceMetrics[]): FaceMetrics =>
  Object.fromEntries(KEYS.map(k => [k, median(samples.map(s => s[k]))])) as unknown as FaceMetrics;

export interface Classification {
  shape: FaceShape;
  /** Segunda forma más cercana, si está casi empatada con la primera */
  alternative: FaceShape | null;
  /** Distancia a cada prototipo (menor = más parecido). Útil para calibrar. */
  distances: Record<FaceShape, number>;
}

export function classifyFaceShape(m: FaceMetrics): Classification {
  const distances = Object.fromEntries(
    (Object.keys(PROTOTYPES) as FaceShape[]).map(shape => {
      const proto = PROTOTYPES[shape];
      const d = Math.sqrt(
        KEYS.reduce((sum, k) => {
          const target = BASELINE[k] + (proto[k] ?? 0);
          return sum + ((m[k] - target) / SPREAD[k]) ** 2;
        }, 0),
      );
      return [shape, d];
    }),
  ) as Record<FaceShape, number>;

  const ranked = (Object.keys(distances) as FaceShape[]).sort((a, b) => distances[a] - distances[b]);
  const [first, second] = ranked;
  const close = distances[second] - distances[first] < 0.35;

  return { shape: first, alternative: close ? second : null, distances };
}
