import { useEffect, useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { Calendar, Clock, User, Mail, Phone, FileText, RefreshCw, Filter } from 'lucide-react';
import {
  getAllAppointments,
  updateAppointmentStatus,
  TIPO_LABELS,
  STATUS_LABELS,
  type Appointment,
  type AppointmentStatus,
} from '../../types/appointment';
import toast from 'react-hot-toast';

// Badge de estado

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pendiente:  'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmada: 'bg-green-100  text-green-800  border-green-200',
  cancelada:  'bg-red-100    text-red-800    border-red-200',
};

const StatusBadge = ({ status }: { status: AppointmentStatus }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[status]}`}>
    {STATUS_LABELS[status]}
  </span>
);

// Tarjeta de cita

const AppointmentCard = ({
  apt,
  onStatus,
}: {
  apt: Appointment;
  onStatus: (id: string, s: AppointmentStatus) => void;
}) => {
  const [saving, setSaving] = useState(false);

  const change = async (newStatus: AppointmentStatus) => {
    setSaving(true);
    await onStatus(apt.id, newStatus);
    setSaving(false);
  };

  const dateStr = new Date(apt.fecha + 'T12:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-bold text-primary-purple text-lg">{TIPO_LABELS[apt.tipo]}</p>
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
            <span className="flex items-center gap-1"><Calendar size={14} className="text-primary-gold" /> {dateStr}</span>
            <span className="flex items-center gap-1"><Clock size={14} className="text-primary-gold" /> {apt.hora}</span>
          </div>
        </div>
        <StatusBadge status={apt.status} />
      </div>

      {/* Datos del paciente */}
      <div className="bg-neutral-light rounded-xl p-4 grid sm:grid-cols-2 gap-3 text-sm">
        <span className="flex items-center gap-2 text-gray-700">
          <User size={15} className="text-primary-purple shrink-0" /> {apt.nombre}
        </span>
        <a href={`mailto:${apt.email}`} className="flex items-center gap-2 text-primary-purple hover:underline">
          <Mail size={15} className="shrink-0" /> {apt.email}
        </a>
        <a href={`tel:${apt.telefono}`} className="flex items-center gap-2 text-gray-700 hover:text-primary-purple">
          <Phone size={15} className="text-primary-purple shrink-0" /> {apt.telefono}
        </a>
        {apt.notas && (
          <span className="flex items-start gap-2 text-gray-500 sm:col-span-2">
            <FileText size={15} className="text-primary-purple shrink-0 mt-0.5" /> {apt.notas}
          </span>
        )}
      </div>

      {/* Acciones */}
      {apt.status === 'pendiente' && (
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => change('confirmada')}
            disabled={saving}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-60"
          >
            {saving ? '...' : 'Confirmar'}
          </button>
          <button
            onClick={() => change('cancelada')}
            disabled={saving}
            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2.5 rounded-xl font-semibold text-sm transition disabled:opacity-60"
          >
            {saving ? '...' : 'Cancelar'}
          </button>
        </div>
      )}

      {apt.status !== 'pendiente' && (
        <button
          onClick={() => change('pendiente')}
          disabled={saving}
          className="text-xs text-gray-400 hover:text-primary-purple transition text-left disabled:opacity-60"
        >
          Volver a pendiente
        </button>
      )}
    </div>
  );
};

// Página admin

type FilterStatus = 'todas' | AppointmentStatus;

const AdminCitas = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState<FilterStatus>('pendiente');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllAppointments();
      setAppointments(data);
    } catch (err: any) {
      toast.error('Error al cargar citas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id: string, status: AppointmentStatus) => {
    try {
      await updateAppointmentStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast.success(`Cita ${STATUS_LABELS[status].toLowerCase()}`);
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    }
  };

  const filtered = filter === 'todas'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const counts: Record<FilterStatus, number> = {
    todas:      appointments.length,
    pendiente:  appointments.filter(a => a.status === 'pendiente').length,
    confirmada: appointments.filter(a => a.status === 'confirmada').length,
    cancelada:  appointments.filter(a => a.status === 'cancelada').length,
  };

  const FILTERS: { value: FilterStatus; label: string; color: string }[] = [
    { value: 'todas',      label: 'Todas',      color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
    { value: 'pendiente',  label: 'Pendientes', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
    { value: 'confirmada', label: 'Confirmadas',color: 'bg-green-100 text-green-800 hover:bg-green-200' },
    { value: 'cancelada',  label: 'Canceladas', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
  ];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary-purple">Citas</h2>
          <p className="text-gray-500 mt-1">{appointments.length} cita{appointments.length !== 1 ? 's' : ''} registrada{appointments.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 bg-white border border-gray-200 hover:border-primary-purple text-gray-600 hover:text-primary-purple px-4 py-2.5 rounded-xl transition text-sm font-medium"
        >
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Filter size={16} className="text-gray-400 self-center mr-1" />
        {FILTERS.map(({ value, label, color }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              filter === value ? 'ring-2 ring-primary-purple ' + color : color
            }`}
          >
            {label} ({counts[value]})
          </button>
        ))}
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg">No hay citas {filter !== 'todas' ? STATUS_LABELS[filter as AppointmentStatus].toLowerCase() + 's' : ''}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map(apt => (
            <AppointmentCard key={apt.id} apt={apt} onStatus={handleStatus} />
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCitas;