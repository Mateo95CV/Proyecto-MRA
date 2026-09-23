// Panel para calibrar el detector (/visagismo?calibrar=1).
// Guarda en este navegador las medidas junto con la forma real que indica la optómetra,
// para poder ajustar BASELINE y PROTOTYPES en src/lib/faceShape.ts.
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FACE_SHAPES, type FaceShape } from '../data/visagismo';
import type { Classification, FaceMetrics } from '../lib/faceShape';

const STORAGE_KEY = 'mra-calibracion-visagismo';

interface Entry {
  real: FaceShape;
  detectada: FaceShape;
  metrics: FaceMetrics;
}

const load = (): Entry[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
};

const save = (entries: Entry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Sin almacenamiento (modo privado): la lista vive solo mientras la página esté abierta
  }
};

const label = (id: FaceShape) => FACE_SHAPES.find(s => s.id === id)!.label;

interface CalibrationPanelProps {
  result: Classification;
  metrics: FaceMetrics;
}

const CalibrationPanel = ({ result, metrics }: CalibrationPanelProps) => {
  const [entries, setEntries] = useState<Entry[]>(load);
  const [real, setReal] = useState<FaceShape | ''>('');
  const [savedCurrent, setSavedCurrent] = useState(false);

  const update = (next: Entry[]) => {
    setEntries(next);
    save(next);
  };

  const add = () => {
    if (!real) return;
    update([...entries, { real, detectada: result.shape, metrics }]);
    setSavedCurrent(true);
  };

  const copy = async () => {
    const header = 'real,detectada,lengthRatio,foreheadRatio,jawRatio,chinRatio';
    const rows = entries.map(e =>
      [e.real, e.detectada, ...Object.values(e.metrics).map(v => v.toFixed(3))].join(','),
    );
    try {
      await navigator.clipboard.writeText([header, ...rows].join('\n'));
      toast.success('Medidas copiadas');
    } catch {
      toast.error('No se pudo copiar; selecciona la tabla y cópiala a mano');
    }
  };

  const ranked = (Object.keys(result.distances) as FaceShape[])
    .sort((a, b) => result.distances[a] - result.distances[b]);

  return (
    <section className="mt-6 rounded-3xl border-2 border-dashed border-primary-gold p-5 sm:p-7 text-sm">
      <h3 className="font-semibold text-base">Modo calibración</h3>

      <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
        {(Object.entries(metrics) as [keyof FaceMetrics, number][]).map(([k, v]) => (
          <div key={k}>
            <dt className="text-ink/55 text-xs">{k}</dt>
            <dd className="font-semibold">{v.toFixed(3)}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-ink/60 text-xs">
        Distancia a cada forma (menor = más parecido):{' '}
        {ranked.map(s => `${label(s)} ${result.distances[s].toFixed(2)}`).join(', ')}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label htmlFor="forma-real" className="font-medium">Forma real según la optómetra</label>
        <select
          id="forma-real"
          value={real}
          onChange={e => { setReal(e.target.value as FaceShape); setSavedCurrent(false); }}
          className="border border-line rounded-full px-4 py-2 bg-white"
        >
          <option value="">Elegir…</option>
          {FACE_SHAPES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <button
          onClick={add}
          disabled={!real || savedCurrent}
          className="bg-ink text-white px-4 py-2 rounded-full font-semibold disabled:opacity-40"
        >
          {savedCurrent ? 'Guardada' : 'Guardar medición'}
        </button>
      </div>

      {entries.length > 0 && (
        <>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-xs tabular-nums">
              <thead className="text-left text-ink/55">
                <tr>
                  <th className="py-1 pr-3">Real</th>
                  <th className="py-1 pr-3">Detectada</th>
                  <th className="py-1 pr-3">Largo</th>
                  <th className="py-1 pr-3">Frente</th>
                  <th className="py-1 pr-3">Mandíbula</th>
                  <th className="py-1 pr-3">Barbilla</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={i} className={`border-t border-line ${e.real === e.detectada ? '' : 'text-red-700'}`}>
                    <td className="py-1 pr-3">{label(e.real)}</td>
                    <td className="py-1 pr-3">{label(e.detectada)}</td>
                    <td className="py-1 pr-3">{e.metrics.lengthRatio.toFixed(3)}</td>
                    <td className="py-1 pr-3">{e.metrics.foreheadRatio.toFixed(3)}</td>
                    <td className="py-1 pr-3">{e.metrics.jawRatio.toFixed(3)}</td>
                    <td className="py-1 pr-3">{e.metrics.chinRatio.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-ink/60 text-xs">
            Aciertos: {entries.filter(e => e.real === e.detectada).length} de {entries.length}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={copy} className="bg-primary-purple text-white px-4 py-2 rounded-full font-semibold">
              Copiar todo (CSV)
            </button>
            <button
              onClick={() => update([])}
              className="border border-line px-4 py-2 rounded-full font-semibold text-ink/70"
            >
              Borrar lista
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default CalibrationPanel;
