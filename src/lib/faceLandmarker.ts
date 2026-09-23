// Carga perezosa de MediaPipe Face Landmarker. Solo se descarga cuando alguien
// activa la cámara en /visagismo, así no pesa en el resto del sitio.
import type { FaceLandmarker } from '@mediapipe/tasks-vision';
import wasmLoaderPath from '@mediapipe/tasks-vision/vision_wasm_internal.js?url';
import wasmBinaryPath from '@mediapipe/tasks-vision/vision_wasm_internal.wasm?url';

// Modelo oficial de Google (~3.7 MB). Solo se descarga el modelo; ninguna imagen sale del navegador.
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

async function create(): Promise<FaceLandmarker> {
  const { FaceLandmarker } = await import('@mediapipe/tasks-vision');
  const fileset = { wasmLoaderPath, wasmBinaryPath };
  const options = (delegate: 'GPU' | 'CPU') => ({
    baseOptions: { modelAssetPath: MODEL_URL, delegate },
    runningMode: 'VIDEO' as const,
    numFaces: 1,
  });

  try {
    return await FaceLandmarker.createFromOptions(fileset, options('GPU'));
  } catch {
    // Algunos equipos no soportan WebGL2; la CPU es más lenta pero suficiente
    return FaceLandmarker.createFromOptions(fileset, options('CPU'));
  }
}

/** Devuelve siempre la misma instancia; si falla, permite reintentar. */
export function loadFaceLandmarker(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = create().catch(err => {
      landmarkerPromise = null;
      throw err;
    });
  }
  return landmarkerPromise;
}
