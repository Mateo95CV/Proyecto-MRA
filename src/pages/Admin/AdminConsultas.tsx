import { useEffect, useState, useCallback } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import {
  Plus, Search, X, Save, ChevronDown, ChevronUp,
  User, FileText, Eye, CreditCard, Clock, CheckCircle, XCircle,
  History, Stethoscope,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllConsultas, createConsulta, updateConsulta, updateOtStatus,
  getAllPacientes, createPaciente, searchPacientes,
  TIPO_LENTE_LABELS, OT_STATUS_LABELS, ESTADO_PAGO_LABELS,
  type Consulta, type Paciente, type NewConsulta, type NewPaciente,
  type TipoLente, type OtStatus, type EstadoPago,
} from '../../types/consulta';
import { getProducts, type Product } from '../../types/product';


const OT_STATUS_STYLES: Record<OtStatus, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  entregada: 'bg-green-100  text-green-800  border-green-200',
  cancelada: 'bg-red-100    text-red-800    border-red-200',
};

const PAGO_STYLES: Record<EstadoPago, string> = {
  pendiente: 'bg-orange-100 text-orange-800 border-orange-200',
  parcial:   'bg-blue-100   text-blue-800   border-blue-200',
  pagado:    'bg-green-100  text-green-800  border-green-200',
};

const OT_ICONS: Record<OtStatus, React.ReactNode> = {
  pendiente: <Clock    size={14} />,
  entregada: <CheckCircle size={14} />,
  cancelada: <XCircle  size={14} />,
};

interface ConsultaFormProps {
  consulta?: Consulta | null;
  pacientes: Paciente[];
  products: Product[];
  onSave: () => void;
  onClose: () => void;
}

const ConsultaForm = ({ consulta, products, onSave, onClose }: ConsultaFormProps) => {
  const isEdit = !!consulta;

  // Paciente
  const [pacienteId,    setPacienteId]    = useState(consulta?.paciente_id ?? '');
  const [pacienteQuery, setPacienteQuery] = useState(consulta?.paciente?.nombre ?? '');
  const [pacienteSugs,  setPacienteSugs]  = useState<Paciente[]>([]);
  const [newPac,        setNewPac]        = useState(false);
  const [pacForm,       setPacForm]       = useState<Partial<NewPaciente>>({});

  // OT
  const [otNumero,      setOtNumero]      = useState(consulta?.ot_numero ?? '');
  const [fechaConsulta, setFechaConsulta] = useState(consulta?.fecha_consulta ?? new Date().toISOString().split('T')[0]);
  const [tipoLente,     setTipoLente]     = useState<TipoLente>(consulta?.tipo_lente ?? 'monofocal');
  const [productoId,    setProductoId]    = useState(consulta?.producto_id ?? '');
  const [monturaDesc,   setMonturaDesc]   = useState(consulta?.montura_desc ?? '');
  const [precioTotal,   setPrecioTotal]   = useState(String(consulta?.precio_total ?? ''));
  const [abono,         setAbono]         = useState(String(consulta?.abono ?? '0'));
  const [estadoPago,    setEstadoPago]    = useState<EstadoPago>(consulta?.estado_pago ?? 'pendiente');
  const [status,        setStatus]        = useState<OtStatus>(consulta?.status ?? 'pendiente');
  const [observaciones, setObservaciones] = useState(consulta?.observaciones ?? '');

  const [saving, setSaving] = useState(false);

  // Búsqueda de paciente
  useEffect(() => {
    if (pacienteQuery.length < 2 || pacienteId) { setPacienteSugs([]); return; }
    searchPacientes(pacienteQuery).then(setPacienteSugs);
  }, [pacienteQuery, pacienteId]);

  const selectPaciente = (p: Paciente) => {
    setPacienteId(p.id);
    setPacienteQuery(p.nombre);
    setPacienteSugs([]);
    setNewPac(false);
  };

  const handleSave = async () => {
    if (!otNumero.trim())     { toast.error('Ingresa el número de OT'); return; }
    if (!fechaConsulta)       { toast.error('Selecciona la fecha'); return; }
    if (!precioTotal)         { toast.error('Ingresa el precio total'); return; }

    let finalPacienteId = pacienteId;

    // Crear paciente nuevo si aplica
    if (newPac) {
      if (!pacForm.nombre?.trim()) { toast.error('El nombre del paciente es obligatorio'); return; }
      setSaving(true);
      try {
        const p = await createPaciente({ nombre: pacForm.nombre!, ...pacForm });
        finalPacienteId = p.id;
      } catch (e: any) { toast.error(e.message); setSaving(false); return; }
    }

    if (!finalPacienteId) { toast.error('Selecciona o crea un paciente'); return; }

    setSaving(true);
    try {
      const payload: NewConsulta = {
        ot_numero:      otNumero.trim(),
        paciente_id:    finalPacienteId,
        fecha_consulta: fechaConsulta,
        tipo_lente:     tipoLente,
        producto_id:    productoId || null,
        montura_desc:   monturaDesc,
        precio_total:   parseFloat(precioTotal) || 0,
        abono:          parseFloat(abono)       || 0,
        estado_pago:    estadoPago,
        status,
        observaciones
      };

      if (isEdit) await updateConsulta(consulta.id, payload);
      else        await createConsulta(payload);

      toast.success(isEdit ? 'OT actualizada' : 'OT creada correctamente');
      onSave();
    } catch (e: any) {
      toast.error(e.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-6">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-primary-purple">
              {isEdit ? `Editar OT ${consulta.ot_numero}` : 'Nueva Consulta / OT'}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">Completa los datos de la orden de trabajo</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
            <X size={22} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-8">

          {/* ── Sección 1: Identificación ── */}
          <div>
            <h3 className="text-sm font-bold text-primary-purple uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText size={16} /> Identificación de la OT
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nº OT <span className="text-red-500">*</span></label>
                <input
                  value={otNumero}
                  onChange={e => setOtNumero(e.target.value)}
                  placeholder="OT-2025-001"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-gold text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha consulta <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={fechaConsulta}
                  onChange={e => setFechaConsulta(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-gold text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado OT</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as OtStatus)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-gold text-sm bg-white"
                >
                  {(Object.keys(OT_STATUS_LABELS) as OtStatus[]).map(s => (
                    <option key={s} value={s}>{OT_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Sección 2: Paciente ── */}
          <div>
            <h3 className="text-sm font-bold text-primary-purple uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={16} /> Paciente
            </h3>

            {!newPac ? (
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={pacienteQuery}
                  onChange={e => { setPacienteQuery(e.target.value); setPacienteId(''); }}
                  placeholder="Buscar por nombre o documento..."
                  className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary-gold text-sm"
                />
                {pacienteSugs.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                    {pacienteSugs.map(p => (
                      <button
                        key={p.id}
                        onClick={() => selectPaciente(p)}
                        className="w-full text-left px-4 py-3 hover:bg-neutral-light transition text-sm flex items-center justify-between"
                      >
                        <span className="font-medium">{p.nombre}</span>
                        <span className="text-gray-400 text-xs">{p.documento ?? p.telefono}</span>
                      </button>
                    ))}
                  </div>
                )}
                {pacienteId && (
                  <div className="mt-2 flex items-center gap-2 text-green-700 text-sm">
                    <CheckCircle size={16} />
                    Paciente seleccionado: <span className="font-semibold">{pacienteQuery}</span>
                    <button onClick={() => { setPacienteId(''); setPacienteQuery(''); }} className="text-gray-400 hover:text-red-500 ml-1"><X size={14} /></button>
                  </div>
                )}
                <button
                  onClick={() => setNewPac(true)}
                  className="mt-3 text-sm text-primary-purple hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Crear nuevo paciente
                </button>
              </div>
            ) : (
              <div className="border border-primary-purple/20 rounded-2xl p-5 space-y-4 bg-purple-50/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-primary-purple">Nuevo paciente</p>
                  <button onClick={() => setNewPac(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancelar</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'nombre',    label: 'Nombre completo *', type: 'text'  },
                    { key: 'documento', label: 'CC / Documento',    type: 'text'  },
                    { key: 'telefono',  label: 'Teléfono',          type: 'tel'   },
                    { key: 'email',     label: 'Correo',            type: 'email' },
                    { key: 'fecha_nac', label: 'Fecha nacimiento',  type: 'date'  },
                    { key: 'direccion', label: 'Dirección',         type: 'text'  },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-600 font-medium block mb-1">{label}</label>
                      <input
                        type={type}
                        value={(pacForm as any)[key] ?? ''}
                        onChange={e => setPacForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-gold"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sección 3: Fórmula óptica ── */}
          <div>
            <h3 className="text-sm font-bold text-primary-purple uppercase tracking-wider mb-4 flex items-center gap-2">
              <Stethoscope size={16} /> Fórmula Óptica
            </h3>
            

            {/* Tipo de lente */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de lente</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(TIPO_LENTE_LABELS) as TipoLente[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTipoLente(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition
                      ${tipoLente === t
                        ? 'bg-primary-purple text-white border-primary-purple'
                        : 'bg-white border-gray-300 hover:border-primary-purple text-gray-700'}`}
                  >
                    {TIPO_LENTE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sección 4: Montura ── */}
          <div>
            <h3 className="text-sm font-bold text-primary-purple uppercase tracking-wider mb-4 flex items-center gap-2">
              <Eye size={16} /> Montura
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Producto del catálogo</label>
                <select
                  value={productoId}
                  onChange={e => setProductoId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-gold text-sm bg-white"
                >
                  <option value="">— Sin seleccionar —</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.brand} · ${p.price.toLocaleString('es-CO')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción libre</label>
                <input
                  value={monturaDesc}
                  onChange={e => setMonturaDesc(e.target.value)}
                  placeholder="Ej: Montura Ray-Ban negra ref. 5154"
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-gold text-sm"
                />
              </div>
            </div>
          </div>

          {/* ── Sección 5: Pago ── */}
          <div>
            <h3 className="text-sm font-bold text-primary-purple uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard size={16} /> Pago
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio total <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    value={precioTotal}
                    onChange={e => setPrecioTotal(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-2.5 focus:outline-none focus:border-primary-gold text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Abono inicial</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    value={abono}
                    onChange={e => setAbono(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-2.5 focus:outline-none focus:border-primary-gold text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado de pago</label>
                <select
                  value={estadoPago}
                  onChange={e => setEstadoPago(e.target.value as EstadoPago)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary-gold text-sm bg-white"
                >
                  {(Object.keys(ESTADO_PAGO_LABELS) as EstadoPago[]).map(s => (
                    <option key={s} value={s}>{ESTADO_PAGO_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>
            {precioTotal && (
              <p className="mt-2 text-sm text-gray-500">
                Saldo pendiente: <span className="font-semibold text-primary-purple">
                  ${(parseFloat(precioTotal || '0') - parseFloat(abono || '0')).toLocaleString('es-CO')}
                </span>
              </p>
            )}
          </div>

          {/* ── Sección 6: Observaciones ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={e => setObservaciones(e.target.value)}
              rows={3}
              placeholder="Notas clínicas, indicaciones especiales, etc."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-gold text-sm resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:border-primary-purple transition text-sm font-medium">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-2.5 bg-primary-purple hover:bg-purple-900 text-white rounded-xl font-bold transition text-sm flex items-center gap-2 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'Guardando...' : isEdit ? 'Actualizar OT' : 'Crear OT'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Tarjeta de consulta

const ConsultaCard = ({
  consulta, onEdit, onStatus, historial,
}: {
  consulta: Consulta;
  onEdit: (c: Consulta) => void;
  onStatus: (id: string, s: OtStatus) => void;
  historial: Consulta[];
}) => {
  const [expanded, setExpanded] = useState(false);
  const saldo = consulta.precio_total - consulta.abono;
  const otrasConsultas = historial.filter(h => h.id !== consulta.id);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">

      {/* Header tarjeta */}
      <div className="p-5 flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary-purple/10 rounded-xl flex items-center justify-center shrink-0">
            <FileText size={20} className="text-primary-purple" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-primary-purple font-mono text-base">{consulta.ot_numero}</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${OT_STATUS_STYLES[consulta.status]}`}>
                {OT_ICONS[consulta.status]} {OT_STATUS_LABELS[consulta.status]}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${PAGO_STYLES[consulta.estado_pago]}`}>
                <CreditCard size={11} /> {ESTADO_PAGO_LABELS[consulta.estado_pago]}
              </span>
            </div>
            <p className="font-semibold text-gray-800 mt-0.5">{consulta.paciente?.nombre}</p>
            <p className="text-xs text-gray-400">
              {new Date(consulta.fecha_consulta + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
              {' · '}{consulta.paciente?.telefono ?? consulta.paciente?.email ?? ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right mr-2">
            <p className="font-bold text-primary-gold">${consulta.precio_total.toLocaleString('es-CO')}</p>
            {saldo > 0 && <p className="text-xs text-orange-600">Saldo: ${saldo.toLocaleString('es-CO')}</p>}
          </div>
          <button
            onClick={() => onEdit(consulta)}
            className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500 hover:text-primary-purple"
            title="Editar"
          >
            <FileText size={18} />
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Detalle expandido */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-5">

          {/* Montura */}
          {(consulta.montura_desc) && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Montura</p>
              <p className="text-sm text-gray-700">{consulta.montura_desc}</p>
            </div>
          )}

          {/* Observaciones */}
          {consulta.observaciones && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Observaciones</p>
              <p className="text-sm text-gray-600">{consulta.observaciones}</p>
            </div>
          )}

          {/* Historial del paciente */}
          {otrasConsultas.length > 0 && (
            <div className="bg-neutral-light rounded-xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                <History size={13} /> Historial del paciente ({otrasConsultas.length} consulta{otrasConsultas.length > 1 ? 's' : ''} anterior{otrasConsultas.length > 1 ? 'es' : ''})
              </p>
              <div className="space-y-1.5">
                {otrasConsultas.slice(0, 3).map(h => (
                  <div key={h.id} className="flex items-center justify-between text-xs text-gray-600">
                    <span className="font-mono font-semibold">{h.ot_numero}</span>
                    <span>{new Date(h.fecha_consulta + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${OT_STATUS_STYLES[h.status]}`}>{OT_STATUS_LABELS[h.status]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acciones de estado */}
          {consulta.status === 'pendiente' && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onStatus(consulta.id, 'entregada')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-sm font-semibold transition"
              >
                Marcar entregada
              </button>
              <button
                onClick={() => onStatus(consulta.id, 'cancelada')}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-xl text-sm font-semibold transition"
              >
                Cancelar OT
              </button>
            </div>
          )}
          {consulta.status !== 'pendiente' && (
            <button
              onClick={() => onStatus(consulta.id, 'pendiente')}
              className="text-xs text-gray-400 hover:text-primary-purple transition"
            >
              Volver a pendiente
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Página principal

type FilterStatus = 'todas' | OtStatus;

const AdminConsultas = () => {
  const [consultas,  setConsultas]  = useState<Consulta[]>([]);
  const [pacientes,  setPacientes]  = useState<Paciente[]>([]);
  const [products,   setProducts]   = useState<Product[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState<FilterStatus>('todas');
  const [search,     setSearch]     = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState<Consulta | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, p, pr] = await Promise.all([getAllConsultas(), getAllPacientes(), getProducts()]);
      setConsultas(c);
      setPacientes(p);
      setProducts(pr);
    } catch (e: any) {
      toast.error('Error al cargar: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (id: string, status: OtStatus) => {
    try {
      await updateOtStatus(id, status);
      setConsultas(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      toast.success(OT_STATUS_LABELS[status]);
    } catch (e: any) { toast.error(e.message); }
  };

  const openNew  = () => { setEditTarget(null); setShowForm(true); };
  const openEdit = (c: Consulta) => { setEditTarget(c); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditTarget(null); };
  const afterSave = () => { closeForm(); load(); };

  // Filtrado y búsqueda
  const displayed = consultas
    .filter(c => filter === 'todas' || c.status === filter)
    .filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.ot_numero.toLowerCase().includes(q) ||
        c.paciente?.nombre?.toLowerCase().includes(q) ||
        c.paciente?.documento?.toLowerCase().includes(q)
      );
    });

  const counts = {
    todas:     consultas.length,
    pendiente: consultas.filter(c => c.status === 'pendiente').length,
    entregada: consultas.filter(c => c.status === 'entregada').length,
    cancelada: consultas.filter(c => c.status === 'cancelada').length,
  };

  const FILTERS: { value: FilterStatus; label: string; style: string }[] = [
    { value: 'todas',     label: 'Todas',     style: 'bg-gray-100 text-gray-700'   },
    { value: 'pendiente', label: 'Pendientes',style: 'bg-yellow-100 text-yellow-800' },
    { value: 'entregada', label: 'Entregadas',style: 'bg-green-100 text-green-800'  },
    { value: 'cancelada', label: 'Canceladas',style: 'bg-red-100 text-red-800'      },
  ];

  // Historial por paciente
  const historialMap: Record<string, Consulta[]> = {};
  consultas.forEach(c => {
    if (!historialMap[c.paciente_id]) historialMap[c.paciente_id] = [];
    historialMap[c.paciente_id].push(c);
  });

  return (
    <AdminLayout>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary-purple">Consultas / OT</h2>
          <p className="text-gray-500 mt-0.5">{consultas.length} orden{consultas.length !== 1 ? 'es' : ''} registrada{consultas.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary-purple hover:bg-purple-900 text-white px-6 py-3 rounded-xl font-bold transition shadow-md"
        >
          <Plus size={20} /> Nueva OT
        </button>
      </div>

      {/* Barra de búsqueda + filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por OT, nombre o documento..."
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary-gold text-sm bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(({ value, label, style }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${style} ${filter === value ? 'ring-2 ring-primary-purple' : 'opacity-70 hover:opacity-100'}`}
            >
              {label} ({counts[value as keyof typeof counts]})
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No hay consultas {filter !== 'todas' ? OT_STATUS_LABELS[filter as OtStatus].toLowerCase() + 's' : ''}</p>
          <button onClick={openNew} className="mt-4 text-primary-purple hover:underline text-sm font-medium">
            + Crear primera OT
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {displayed.map(c => (
            <ConsultaCard
              key={c.id}
              consulta={c}
              onEdit={openEdit}
              onStatus={handleStatus}
              historial={historialMap[c.paciente_id] ?? []}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <ConsultaForm
          consulta={editTarget}
          pacientes={pacientes}
          products={products}
          onSave={afterSave}
          onClose={closeForm}
        />
      )}
    </AdminLayout>
  );
};

export default AdminConsultas;