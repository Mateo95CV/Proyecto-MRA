// src/lib/supabaseClient.ts
// ─────────────────────────────────────────────
//  Configura el cliente de Supabase.
//  Las variables de entorno se definen en .env
// ─────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '❌ Faltan variables de entorno: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY\n' +
    'Crea el archivo .env en la raíz del proyecto (ver .env.example)'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storageKey: 'optica-auth-key', // Cambia el nombre de la llave
    persistSession: true,
  },
  // Desactivar temporalmente los locks si el navegador se queda pegado
  // Nota: Úsalo solo si el Singleton no arregla el cuelgue
})