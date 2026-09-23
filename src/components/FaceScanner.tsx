// Detección automática de la forma del rostro con la cámara.
// El video se procesa fotograma a fotograma en el navegador y nunca se guarda ni se envía.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Loader2, ScanFace, X } from 'lucide-react';
import { loadFaceLandmarker } from '../lib/faceLandmarker';
import {
  aggregateMetrics,
  checkPose,
  classifyFaceShape,
  computeMetrics,
  toPixels,
  type Classification,
  type FaceMetrics,
  type PoseIssue,
} from '../lib/faceShape';

const SAMPLES_NEEDED = 30;

type Status = 'consent' | 'loading' | 'scanning' | 'error';
type Hint = PoseIssue | 'sin-rostro' | 'ok';

const HINTS: Record<NonNullable<Hint>, string> = {
  'sin-rostro': 'Ubica tu rostro dentro del óvalo',
  lejos:        'Acércate un poco a la cámara',
  girado:       'Mira de frente a la cámara',
  inclinado:    'Mantén la cabeza recta',
  ok:           'No te muevas, estamos midiendo…',
};

function cameraErrorMessage(err: unknown): string {
  const name = (err as DOMException)?.name;
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'No diste permiso para usar la cámara. Puedes habilitarlo en la configuración del navegador o elegir tu forma de rostro manualmente.';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return 'No encontramos una cámara en este dispositivo.';
  }
  if (name === 'NotReadableError') {
    return 'La cámara está siendo usada por otra aplicación. Ciérrala e intenta de nuevo.';
  }
  return 'No pudimos iniciar el detector. Revisa tu conexión e intenta de nuevo.';
}

interface FaceScannerProps {
  onDetected: (result: Classification, metrics: FaceMetrics) => void;
  onClose: () => void;
}

const FaceScanner = ({ onDetected, onClose }: FaceScannerProps) => {
  const [status, setStatus] = useState<Status>('consent');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [hint, setHint] = useState<Hint>('sin-rostro');
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  // Apaga la cámara si el usuario sale de la página
  useEffect(() => stopCamera, []);

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Tu navegador no permite usar la cámara aquí. Prueba con Chrome, Edge o Safari actualizados.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setProgress(0);
    setHint('sin-rostro');

    try {
      const [stream, landmarker] = await Promise.all([
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        }),
        loadFaceLandmarker(),
      ]);
      streamRef.current = stream;

      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setStatus('scanning');

      const samples: FaceMetrics[] = [];
      let lastTime = -1;

      const loop = () => {
        if (video.readyState >= 2 && video.currentTime !== lastTime) {
          lastTime = video.currentTime;
          const face = landmarker.detectForVideo(video, performance.now()).faceLandmarks[0];

          if (!face) {
            setHint('sin-rostro');
          } else {
            const points = toPixels(face, video.videoWidth, video.videoHeight);
            const issue = checkPose(points, video.videoWidth);
            if (issue) {
              setHint(issue);
            } else {
              samples.push(computeMetrics(points));
              setHint('ok');
              setProgress(samples.length);
            }
          }
        }

        if (samples.length >= SAMPLES_NEEDED) {
          stopCamera();
          const metrics = aggregateMetrics(samples);
          onDetected(classifyFaceShape(metrics), metrics);
          return;
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (err) {
      stopCamera();
      setError(cameraErrorMessage(err));
      setStatus('error');
    }
  };

  const close = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="rounded-3xl border border-line overflow-hidden">
      <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-line">
        <h3 className="font-semibold flex items-center gap-2">
          <ScanFace size={20} className="text-primary-purple" /> Detección con cámara
        </h3>
        <button
          onClick={close}
          className="p-2 -mr-2 rounded-full text-ink/50 hover:text-ink hover:bg-neutral-light transition"
          aria-label="Cerrar detección con cámara"
        >
          <X size={18} />
        </button>
      </div>

      {status === 'consent' && (
        <div className="p-5 sm:p-7">
          <ul className="space-y-2 text-sm text-ink/75 mb-6">
            <li>La imagen de tu cámara se analiza <strong>solo en este dispositivo</strong>.</li>
            <li>No tomamos fotos ni guardamos o enviamos tu imagen ni tus medidas.</li>
            <li>La cámara se apaga en cuanto termina la medición (unos segundos).</li>
          </ul>
          <label className="flex items-start gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={e => setAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-primary-purple"
            />
            <span className="text-ink/75">
              Autorizo el uso temporal de mi cámara para estimar la forma de mi rostro, según la{' '}
              <Link to="/politica-privacidad" className="font-semibold text-primary-purple underline underline-offset-2">
                política de privacidad
              </Link>.
            </span>
          </label>
          <button
            onClick={start}
            disabled={!accepted}
            className="mt-6 inline-flex items-center gap-2 bg-primary-purple hover:bg-plum text-white px-6 py-3 rounded-full font-semibold transition disabled:bg-line disabled:text-ink/40 disabled:cursor-not-allowed"
          >
            <Camera size={18} /> Activar cámara
          </button>
        </div>
      )}

      {/* El video existe en 'loading' para poder asignarle el stream antes de mostrarlo */}
      {(status === 'loading' || status === 'scanning') && (
        <div className="relative bg-plum aspect-[4/3] sm:aspect-video">
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover -scale-x-100"
          />

          {/* Guía ovalada */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
            <defs>
              <mask id="face-guide">
                <rect width="100" height="100" fill="white" />
                <ellipse cx="50" cy="48" rx="19" ry="36" fill="black" />
              </mask>
            </defs>
            <rect width="100" height="100" fill="#2A1238" opacity="0.55" mask="url(#face-guide)" />
            <ellipse
              cx="50" cy="48" rx="19" ry="36"
              fill="none"
              stroke={hint === 'ok' ? '#D4AF37' : 'white'}
              strokeWidth="0.6"
              strokeDasharray={hint === 'ok' ? undefined : '2 1.5'}
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {status === 'loading' ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
              <Loader2 size={32} className="animate-spin" />
              <p className="text-sm">Preparando la cámara y el detector…</p>
            </div>
          ) : (
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-plum/90 to-transparent text-white">
              <p className="text-sm font-medium text-center mb-3" aria-live="polite">{HINTS[hint ?? 'ok']}</p>
              <div
                className="h-1.5 rounded-full bg-white/20 overflow-hidden max-w-xs mx-auto"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={SAMPLES_NEEDED}
                aria-valuenow={progress}
                aria-label="Progreso de la medición"
              >
                <div
                  className="h-full bg-primary-gold transition-[width] duration-150"
                  style={{ width: `${(progress / SAMPLES_NEEDED) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="p-5 sm:p-7">
          <p className="text-sm text-ink/75" role="alert">{error}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={start}
              className="bg-primary-purple hover:bg-plum text-white px-5 py-2.5 rounded-full text-sm font-semibold transition"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={close}
              className="border border-line hover:border-ink/30 px-5 py-2.5 rounded-full text-sm font-semibold transition"
            >
              Elegir manualmente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceScanner;
