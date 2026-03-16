import { useState, useRef } from 'react';
import { Upload, RotateCw, ZoomIn, ZoomOut, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { FaceMesh } from '@mediapipe/face_mesh';

const gafasEjemplo = [
  {
    id: '1',
    name: 'Ray-Ban Wayfarer',
    image: 'https://images.vexels.com/media/users/3/147013/isolated/preview/075351f38c1ad109097a1c6de14cd076-gafas-de-sol-wayfarer-negras.png',
    offsetY: -25,
    scaleBase: 1.3,
  },
  {
    id: '2',
    name: 'Oakley Holbrook',
    image: 'https://static.vecteezy.com/system/resources/thumbnails/048/219/988/small/round-black-eyeglasses-with-metal-frame-free-png.png',
    offsetY: -20,
    scaleBase: 1.15,
  },
];

const Visagismo = () => {
  const [fotoUsuario, setFotoUsuario] = useState<string | null>(null);
  const [gafaSeleccionada, setGafaSeleccionada] = useState<number | null>(null);
  const [posicion, setPosicion] = useState({ x: 0, y: 0 });
  const [escala, setEscala] = useState(1);
  const [rotacion, setRotacion] = useState(0);

  const [autoPosicion, setAutoPosicion] = useState({ x: 0, y: 0 });
  const [autoEscala, setAutoEscala] = useState(1);
  const [autoAjustado, setAutoAjustado] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleSubirFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFotoUsuario(reader.result as string);
        setGafaSeleccionada(null);
        setAutoAjustado(false);
        setPosicion({ x: 0, y: 0 });
        setEscala(1);
        setRotacion(0);
        setAutoPosicion({ x: 0, y: 0 });
        setAutoEscala(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSeleccionarGafa = (index: number) => {
    setGafaSeleccionada(index);
    setPosicion({ x: 0, y: 0 });
    setEscala(gafasEjemplo[index].scaleBase || 1);
    setRotacion(0);
    setAutoAjustado(false);
  };

  const ajustarAutomaticamente = async () => {
    if (!fotoUsuario) {
      toast.error('Primero sube una foto');
      return;
    }
    if (gafaSeleccionada === null) {
      toast.error('Selecciona unas gafas primero');
      return;
    }
    if (!canvasRef.current) {
      toast.error('Error interno: canvas no disponible');
      return;
    }

    toast.loading('Detectando cara... (puede tardar unos segundos)', { id: 'face-detect' });

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No contexto 2D');

      // Cargar imagen
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('No se pudo cargar la imagen (posible CORS)'));
        image.src = fotoUsuario;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      console.log('Imagen cargada en canvas. Tamaño:', canvas.width, 'x', canvas.height);

      // FaceMesh
      const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      console.log('Enviando imagen a FaceMesh...');

      const results = await Promise.race([
        faceMesh.send({ image: canvas }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout en detección')), 15000)),
      ]);

      console.log('Results completos:', results);

      faceMesh.close();

      if (!results || !results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        toast.error('No se detectó cara. Prueba otra foto más frontal y clara.', { id: 'face-detect' });
        console.log('No landmarks encontrados');
        return;
      }

      const landmarks = results.multiFaceLandmarks[0];
      console.log('Landmarks detectados:', landmarks.length);

      const leftEye = landmarks[33];
      const rightEye = landmarks[263];

      const centerX = (leftEye.x + rightEye.x) / 2;
      const centerY = (leftEye.y + rightEye.y) / 2;

      const eyeDistance = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);

      const offsetY = gafasEjemplo[gafaSeleccionada].offsetY || -20;
      setAutoPosicion({
        x: (centerX - 0.5) * canvas.width,
        y: (centerY - 0.5) * canvas.height + offsetY,
      });

      const escalaCalculada = eyeDistance * canvas.width * 10; // ← prueba 8-15 aquí
      setAutoEscala(escalaCalculada);

      setAutoAjustado(true);

      toast.success('¡Cara detectada y gafas ajustadas!', { id: 'face-detect' });
    } catch (error: any) {
      console.error('Error completo:', error);
      toast.error(`Error: ${error.message || 'Fallo en detección facial'}`, { id: 'face-detect' });
    }
  };

  const handleDescargar = () => {
    // ... (el mismo código de descargar que tenías, sin cambios)
    if (!fotoUsuario || gafaSeleccionada === null) {
      toast.error('Sube foto y selecciona gafas primero');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = fotoUsuario;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const gafaImg = new Image();
      gafaImg.crossOrigin = 'anonymous';
      gafaImg.src = gafasEjemplo[gafaSeleccionada].image;

      gafaImg.onload = () => {
        const currentEscala = autoAjustado ? autoEscala : escala;
        const currentX = autoAjustado ? autoPosicion.x : posicion.x;
        const currentY = autoAjustado ? autoPosicion.y : posicion.y;

        const gw = gafaImg.width * currentEscala;
        const gh = gafaImg.height * currentEscala;

        ctx.save();
        ctx.translate(canvas.width / 2 + currentX, canvas.height / 2 + currentY);
        ctx.rotate((rotacion * Math.PI) / 180);
        ctx.drawImage(gafaImg, -gw / 2, -gh / 2, gw, gh);
        ctx.restore();

        const link = document.createElement('a');
        link.download = 'prueba-visagismo.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
    };
  };

  return (
    <div className="min-h-screen bg-neutral-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-primary-purple text-center mb-4">
          Visagismo Virtual
        </h1>
        <p className="text-center text-gray-600 text-lg mb-12 max-w-3xl mx-auto">
          Sube una foto frontal clara y usa el ajuste automático para colocar las gafas.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden relative">
            {fotoUsuario ? (
              <div className="relative w-full aspect-[3/4] max-h-[700px] mx-auto bg-gray-100">
                <img
                  src={fotoUsuario}
                  alt="Tu foto"
                  className="w-full h-full object-contain"
                />

                {gafaSeleccionada !== null && (
                  <img
                    src={gafasEjemplo[gafaSeleccionada].image}
                    alt="Gafas"
                    className="absolute pointer-events-none"
                    style={{
                      left: `calc(50% + ${(autoAjustado ? autoPosicion.x : posicion.x)}px)`,
                      top: `calc(50% + ${(autoAjustado ? autoPosicion.y : posicion.y)}px)`,
                      transform: `translate(-50%, -50%) rotate(${rotacion}deg) scale(${
                        autoAjustado ? autoEscala : escala
                      })`,
                      width: '55%',
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-gray-500">
                <Upload size={64} className="mb-4" />
                <p className="text-xl mb-2">Sube una foto tuya</p>
                <p className="text-sm">Frontal, bien iluminada, sin gafas</p>
              </div>
            )}

            {gafaSeleccionada !== null && (
              <div className="absolute bottom-4 left-0 right-0 flex flex-wrap justify-center gap-4 bg-black/60 p-4 rounded-t-xl">
                <button onClick={() => setRotacion(r => r - 15)} className="text-white p-3 hover:bg-white/20 rounded-full">
                  <RotateCw size={24} />
                </button>
                <button onClick={() => setEscala(s => Math.max(0.5, s - 0.1))} className="text-white p-3 hover:bg-white/20 rounded-full">
                  <ZoomOut size={24} />
                </button>
                <button onClick={() => setEscala(s => s + 0.1)} className="text-white p-3 hover:bg-white/20 rounded-full">
                  <ZoomIn size={24} />
                </button>
                <button onClick={handleDescargar} className="bg-primary-gold text-primary-purple px-6 py-3 rounded-full font-bold hover:bg-yellow-400 transition">
                  Descargar prueba
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-primary-purple mb-6">Elige tus gafas</h2>

            <div className="mb-8">
              <input
                type="file"
                accept="image/*"
                onChange={handleSubirFoto}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-primary-purple hover:bg-primary-gold text-white py-4 rounded-2xl font-bold transition flex items-center justify-center gap-3"
              >
                <Upload size={24} />
                Subir mi foto
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-grow">
              {gafasEjemplo.map((gafa, index) => (
                <button
                  key={gafa.id}
                  onClick={() => handleSeleccionarGafa(index)}
                  className={`border-4 rounded-xl overflow-hidden transition-all ${
                    gafaSeleccionada === index 
                      ? 'border-primary-gold scale-105 shadow-lg' 
                      : 'border-transparent hover:border-primary-purple hover:scale-105'
                  }`}
                >
                  <img
                    src={gafa.image}
                    alt={gafa.name}
                    className="w-full h-32 object-contain bg-gray-100 p-2"
                  />
                  <p className="text-center text-sm py-2 font-medium">{gafa.name}</p>
                </button>
              ))}
            </div>

            {fotoUsuario && gafaSeleccionada !== null && (
              <button
                onClick={ajustarAutomaticamente}
                className="mt-6 w-full bg-primary-gold hover:bg-yellow-400 text-primary-purple py-4 rounded-2xl font-bold transition flex items-center justify-center gap-3"
              >
                Ajustar automáticamente a la cara
              </button>
            )}

            {autoAjustado && (
              <p className="mt-4 text-center text-sm text-green-600">
                Ajuste automático aplicado
              </p>
            )}
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default Visagismo;