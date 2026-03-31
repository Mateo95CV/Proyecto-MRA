// src/context/AuthContext.tsx
// Auth 100% con Supabase — sin localStorage manual
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

// ── Tipo de usuario enriquecido con datos del perfil ──
export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<'admin' | 'user'>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── Convierte usuario Supabase + perfil → AppUser ──
async function buildAppUser(supaUser: SupabaseUser): Promise<AppUser> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', supaUser.id)
    .maybeSingle();

  return {
    id:    supaUser.id,
    email: supaUser.email ?? '',
    name:  profile?.name ?? supaUser.email?.split('@')[0] ?? '',
    role:  (profile?.role as 'user' | 'admin') ?? 'user',
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user,    setUser]    = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios de sesión de Supabase (login, logout, refresh)
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) setUser(await buildAppUser(session.user));
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          setUser(await buildAppUser(session.user));
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Login ─────────────────────────────────────────
  const login = async (email: string, password: string): Promise<'admin' | 'user'> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const appUser = await buildAppUser(data.user);
    setUser(appUser);
    return appUser.role;
  };

  // ── Registro ──────────────────────────────────────
  const register = async (email: string, password: string, name: string): Promise<void> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },   // ← el trigger lo inserta en profiles
    });
    if (error) throw error;
  };

  // ── Logout ────────────────────────────────────────
  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
