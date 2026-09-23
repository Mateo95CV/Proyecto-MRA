import { supabase } from '../lib/supabaseClient';

export type AppointmentType =
  | 'examen_visual'
  | 'adaptacion_contacto'
  | 'recogida_pedido'
  | 'consultoria_monturas';

export type AppointmentStatus = 'pendiente' | 'confirmada' | 'cancelada';

export interface Appointment {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  tipo: AppointmentType;
  fecha: string;       // 'YYYY-MM-DD'
  hora: string;        // 'HH:MM'
  notas?: string;
  status: AppointmentStatus;
  created_at: string;
}

export const TIPO_LABELS: Record<AppointmentType, string> = {
  examen_visual:        'Examen Visual',
  adaptacion_contacto:  'Adaptación de Lentes de Contacto',
  recogida_pedido:      'Recogida de Pedido',
  consultoria_monturas: 'Consultoría de Monturas',
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pendiente:  'Pendiente',
  confirmada: 'Confirmada',
  cancelada:  'Cancelada',
};

// Queries para manejar citas en Supabase

export async function createAppointment(
  data: Omit<Appointment, 'id' | 'status' | 'created_at'>
): Promise<void> {
  // Sin .select(): los clientes pueden crear citas pero solo el admin puede leerlas,
  // así que pedir la fila de vuelta haría fallar la inserción por RLS.
  const { error } = await supabase
    .from('appointments')
    .insert([{ ...data, status: 'pendiente' }]);
  if (error) throw error;
}

export async function getAllAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Appointment[];
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}