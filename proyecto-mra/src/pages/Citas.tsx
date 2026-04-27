import { useState } from 'react';
import { Calendar, Clock, User, Mail, Phone, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { createAppointment, TIPO_LABELS, type AppointmentType } from '../types/appointment';


const TIPOS: { value: AppointmentType; emoji: string; desc: string }[] = [
  { value: 'examen_visual',        emoji: '👁️', desc: 'Evaluación completa de tu salud visual' },
  { value: 'adaptacion_contacto',  emoji: '🔬', desc: 'Prueba y ajuste de lentes de contacto' },
  { value: 'recogida_pedido',      emoji: '📦', desc: 'Retira tu pedido en tienda' },
  { value: 'consultoria_monturas', emoji: '🕶️', desc: 'Asesoría personalizada de monturas' },
];

// Genera intervalos de 30 min entre 8am y 6pm (lun–sab)
const HORAS = Array.from({ length: 20 }, (_, i) => {
  const totalMin = 8 * 60 + i * 30;
  const h = Math.floor(totalMin / 60).toString().padStart(2, '0');
  const m = (totalMin % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
});

// Minimo fecha para el siguiente dia (no se puede el mismo dia)
const minDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

// No domingos
const isValidDay = (dateStr: string) => {
  if (!dateStr) return true;
  return new Date(dateStr).getDay() !== 0; // 0 = domingo
};

// Muestra los pasos y el progreso actual

const Steps = ({ current }: { current: number }) => (
  <div className="flex items-center justify-center gap-2 mb-10">
    {['Tipo', 'Datos', 'Fecha y hora', 'Confirmación'].map((label, i) => {
      const step = i + 1;
      const done = current > step;
      const active = current === step;
      return (
        <div key={label} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 ${active ? 'text-primary-purple' : done ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
              ${active ? 'border-primary-purple bg-primary-purple text-white'
                : done  ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 bg-white text-gray-400'}`}
            >
              {done ? <CheckCircle2 size={16} /> : step}
            </div>
            <span className="hidden sm:inline text-sm font-medium">{label}</span>
          </div>
          {i < 3 && <div className={`h-0.5 w-6 sm:w-12 ${done ? 'bg-green-500' : 'bg-gray-200'}`} />}
        </div>
      );
    })}
  </div>
);

// Formulario principal

interface FormData {
  tipo: AppointmentType | '';
  nombre: string;
  email: string;
  telefono: string;
  notas: string;
  fecha: string;
  hora: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const EMPTY: FormData = {
  tipo: '', nombre: '', email: '', telefono: '', notas: '', fecha: '', hora: '',
};

const Citas = () => {
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState<FormData>(EMPTY);
  const [errors, setErrors]   = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field: keyof FormData, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  // Validaciones por paso

  const validateStep1 = () => {
    if (!form.tipo) { setErrors(e => ({ ...e, tipo: 'Selecciona el tipo de cita' })); return false; }
    return true;
  };

  const validateStep2 = () => {
    const e: FormErrors = {};
    if (!form.nombre.trim())            e.nombre   = 'El nombre es obligatorio';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido';
    if (!form.telefono.trim())          e.telefono = 'El teléfono es obligatorio';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: FormErrors = {};
    if (!form.fecha)             e.fecha = 'Selecciona una fecha';
    else if (!isValidDay(form.fecha)) e.fecha = 'No atendemos domingos';
    if (!form.hora)              e.hora  = 'Selecciona una hora';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
    if (step === 3 && validateStep3()) setStep(4);
  };

  const handleSubmit = async () => {
    if (!form.tipo) return;
    setLoading(true);
    try {
      await createAppointment({
        tipo:     form.tipo as AppointmentType,
        nombre:   form.nombre.trim(),
        email:    form.email.trim(),
        telefono: form.telefono.trim(),
        notas:    form.notas.trim(),
        fecha:    form.fecha,
        hora:     form.hora,
      });
      setSuccess(true);
      toast.success('¡Cita agendada exitosamente!');
    } catch (err: any) {
      toast.error('Error al agendar: ' + (err.message ?? 'intenta de nuevo'));
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de éxito

  if (success) {
    const tipoData = TIPOS.find(t => t.value === form.tipo)!;
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={44} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-primary-purple mb-2">¡Cita agendada!</h1>
          <p className="text-gray-500 mb-6">
            Recibirás una confirmación en <span className="font-semibold text-primary-purple">{form.email}</span> cuando el equipo la confirme.
          </p>

          <div className="bg-neutral-light rounded-2xl p-5 text-left space-y-3 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{tipoData.emoji}</span>
              <span className="font-semibold text-primary-purple">{TIPO_LABELS[form.tipo as AppointmentType]}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600 text-sm">
              <Calendar size={16} className="text-primary-gold" />
              {new Date(form.fecha + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-3 text-gray-600 text-sm">
              <Clock size={16} className="text-primary-gold" />
              {form.hora}
            </div>
            <div className="flex items-center gap-3 text-gray-600 text-sm">
              <User size={16} className="text-primary-gold" />
              {form.nombre}
            </div>
          </div>

          <button
            onClick={() => { setForm(EMPTY); setStep(1); setSuccess(false); }}
            className="w-full bg-primary-purple hover:bg-purple-900 text-white py-3 rounded-xl font-bold transition"
          >
            Agendar otra cita
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-purple mb-3">Agenda tu Cita</h1>
          <p className="text-gray-500 text-lg">Óptica MRA · Rionegro, Antioquia</p>
        </div>

        <Steps current={step} />

        <div className="bg-white rounded-3xl shadow-xl p-8">

          {/* ── Paso 1: Tipo de cita ── */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-primary-purple mb-6">¿Qué tipo de cita necesitas?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TIPOS.map(({ value, emoji, desc }) => (
                  <button
                    key={value}
                    onClick={() => set('tipo', value)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all
                      ${form.tipo === value
                        ? 'border-primary-gold bg-amber-50 shadow-md'
                        : 'border-gray-200 hover:border-primary-purple hover:shadow-sm'}`}
                  >
                    <span className="text-3xl block mb-2">{emoji}</span>
                    <p className="font-bold text-primary-purple text-sm">{TIPO_LABELS[value]}</p>
                    <p className="text-gray-500 text-xs mt-1">{desc}</p>
                    {form.tipo === value && (
                      <CheckCircle2 size={18} className="text-primary-gold mt-2" />
                    )}
                  </button>
                ))}
              </div>
              {errors.tipo && <p className="text-red-500 text-sm mt-3">{errors.tipo}</p>}
            </div>
          )}

          {/* ── Paso 2: Datos personales ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-primary-purple mb-2">Tus datos de contacto</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={e => set('nombre', e.target.value)}
                    placeholder="Tu nombre"
                    className={`w-full border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-primary-gold transition ${errors.nombre ? 'border-red-400' : 'border-gray-300'}`}
                  />
                </div>
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="tu@correo.com"
                    className={`w-full border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-primary-gold transition ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={e => set('telefono', e.target.value)}
                    placeholder="300 000 0000"
                    className={`w-full border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-primary-gold transition ${errors.telefono ? 'border-red-400' : 'border-gray-300'}`}
                  />
                </div>
                {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales <span className="text-gray-400">(opcional)</span></label>
                <div className="relative">
                  <FileText size={18} className="absolute left-4 top-4 text-gray-400" />
                  <textarea
                    value={form.notas}
                    onChange={e => set('notas', e.target.value)}
                    placeholder="¿Algún detalle que debamos saber? Ej: uso gafas bifocales..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-primary-gold transition resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Paso 3: Fecha y hora ── */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-primary-purple mb-2">Elige fecha y hora</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de la cita</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    min={minDate()}
                    value={form.fecha}
                    onChange={e => set('fecha', e.target.value)}
                    className={`w-full border rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-primary-gold transition ${errors.fecha ? 'border-red-400' : 'border-gray-300'}`}
                  />
                </div>
                {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
                <p className="text-xs text-gray-400 mt-1">Lunes a sábados · Domingos no atendemos</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora disponible</label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {HORAS.map(h => (
                    <button
                      key={h}
                      onClick={() => set('hora', h)}
                      className={`py-2 px-1 rounded-xl text-sm font-medium border transition
                        ${form.hora === h
                          ? 'bg-primary-purple text-white border-primary-purple'
                          : 'bg-white border-gray-200 hover:border-primary-purple hover:text-primary-purple'}`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
                {errors.hora && <p className="text-red-500 text-xs mt-2">{errors.hora}</p>}
              </div>
            </div>
          )}

          {/* ── Paso 4: Resumen ── */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-primary-purple mb-6">Confirma tu cita</h2>

              <div className="bg-neutral-light rounded-2xl p-6 space-y-4 mb-6">
                {/* Tipo */}
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{TIPOS.find(t => t.value === form.tipo)?.emoji}</span>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Tipo</p>
                    <p className="font-semibold text-primary-purple">{TIPO_LABELS[form.tipo as AppointmentType]}</p>
                  </div>
                </div>
                <hr className="border-gray-200" />
                {/* Fecha / hora */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Calendar size={16} className="mt-0.5 text-primary-gold shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Fecha</p>
                      <p className="font-medium text-gray-700 text-sm">
                        {new Date(form.fecha + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock size={16} className="mt-0.5 text-primary-gold shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Hora</p>
                      <p className="font-medium text-gray-700 text-sm">{form.hora}</p>
                    </div>
                  </div>
                </div>
                <hr className="border-gray-200" />
                {/* Datos */}
                <div className="flex items-start gap-2">
                  <User size={16} className="mt-0.5 text-primary-gold shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Paciente</p>
                    <p className="font-medium text-gray-700 text-sm">{form.nombre}</p>
                    <p className="text-gray-500 text-xs">{form.email} · {form.telefono}</p>
                  </div>
                </div>
                {form.notas && (
                  <>
                    <hr className="border-gray-200" />
                    <div className="flex items-start gap-2">
                      <FileText size={16} className="mt-0.5 text-primary-gold shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Notas</p>
                        <p className="text-gray-600 text-sm">{form.notas}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <p className="text-xs text-gray-400 text-center mb-4">
                Recibirás un correo cuando el equipo confirme tu cita. No es un agendamiento automático.
              </p>
            </div>
          )}

          {/* ── Navegación ── */}
          <div className={`mt-8 flex ${step > 1 ? 'justify-between' : 'justify-end'}`}>
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 hover:border-primary-purple hover:text-primary-purple font-medium transition"
              >
                ← Atrás
              </button>
            )}

            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-primary-purple hover:bg-purple-900 text-white rounded-xl font-bold transition flex items-center gap-2"
              >
                Continuar <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-primary-gold hover:bg-yellow-400 text-primary-purple rounded-xl font-bold transition flex items-center gap-2 disabled:opacity-60"
              >
                {loading ? 'Agendando...' : 'Confirmar cita'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Citas;