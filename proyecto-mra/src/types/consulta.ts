import { supabase } from '../lib/supabaseClient';

// Enums

export type TipoLente    = 'monofocal' | 'bifocal' | 'progresivo' | 'sin_lente';
export type OtStatus     = 'pendiente' | 'entregada' | 'cancelada';
export type EstadoPago   = 'pendiente' | 'parcial' | 'pagado';

export const TIPO_LENTE_LABELS: Record<TipoLente, string> = {
  monofocal:  'Monofocal',
  bifocal:    'Bifocal',
  progresivo: 'Progresivo',
  sin_lente:  'Sin lente',
};

export const OT_STATUS_LABELS: Record<OtStatus, string> = {
  pendiente: 'Pendiente',
  entregada: 'Entregada',
  cancelada: 'Cancelada',
};

export const ESTADO_PAGO_LABELS: Record<EstadoPago, string> = {
  pendiente: 'Pendiente',
  parcial:   'Abono parcial',
  pagado:    'Pagado',
};

// Interfaces

export interface Paciente {
  id:         string;
  nombre:     string;
  documento?: string;
  email?:     string;
  telefono?:  string;
  fecha_nac?: string;
  direccion?: string;
  created_at: string;
}

export interface Consulta {
  id:             string;
  ot_numero:      string;
  paciente_id:    string;
  paciente?:      Paciente;

  tipo_lente:     TipoLente;
  producto_id?:   string | null;
  montura_desc?:  string;

  precio_total:   number;
  abono:          number;
  estado_pago:    EstadoPago;
  status:         OtStatus;
  observaciones?: string;
  fecha_consulta: string;
  created_at:     string;
}



export type NewPaciente = Omit<Paciente, 'id' | 'created_at'>;
export type NewConsulta = Omit<Consulta, 'id' | 'created_at' | 'paciente'>;

// ── Queries: Pacientes ────────────────────────────────────────────────────────

export async function searchPacientes(query: string): Promise<Paciente[]> {
  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .or(`nombre.ilike.%${query}%,documento.ilike.%${query}%`)
    .order('nombre')
    .limit(10);
  if (error) throw error;
  return data ?? [];
}

export async function getAllPacientes(): Promise<Paciente[]> {
  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .order('nombre');
  if (error) throw error;
  return data ?? [];
}

export async function createPaciente(p: NewPaciente): Promise<Paciente> {
  const { data, error } = await supabase
    .from('pacientes')
    .insert([p])
    .select()
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('No se pudo crear el paciente.');
  return data as Paciente;
}

export async function updatePaciente(id: string, p: Partial<NewPaciente>): Promise<void> {
  const { error } = await supabase.from('pacientes').update(p).eq('id', id);
  if (error) throw error;
}

// ── Queries: Consultas ────────────────────────────────────────────────────────

export async function getAllConsultas(): Promise<Consulta[]> {
  const { data, error } = await supabase
    .from('consultas')
    .select('*, paciente:pacientes(*)')
    .order('fecha_consulta', { ascending: false })
    .order('created_at',     { ascending: false });
  if (error) throw error;
  return (data ?? []) as Consulta[];
}

export async function getConsultasByPaciente(pacienteId: string): Promise<Consulta[]> {
  const { data, error } = await supabase
    .from('consultas')
    .select('*, paciente:pacientes(*)')
    .eq('paciente_id', pacienteId)
    .order('fecha_consulta', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Consulta[];
}

export async function createConsulta(c: NewConsulta): Promise<Consulta> {
  const { data, error } = await supabase
    .from('consultas')
    .insert([c])
    .select('*, paciente:pacientes(*)')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('No se pudo crear la consulta.');
  return data as Consulta;
}

export async function updateConsulta(id: string, c: Partial<NewConsulta>): Promise<void> {
  const { error } = await supabase.from('consultas').update(c).eq('id', id);
  if (error) throw error;
}

export async function updateOtStatus(id: string, status: OtStatus): Promise<void> {
  const { error } = await supabase.from('consultas').update({ status }).eq('id', id);
  if (error) throw error;
}