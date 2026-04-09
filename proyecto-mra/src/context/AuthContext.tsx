// src/context/AuthContext.tsx
// Auth 100% con Supabase — sin localStorage manual
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { AuthContext } from './AuthContextInstance';
import type { AppUser } from '../types/auth';

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
    let cancelled = false;

    // Primero obtener la sesión actual
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      setSession(session);
      if (session?.user) {
        setUser(await buildAppUser(session.user));
      }
      setLoading(false); // ← siempre desbloquear aquí
    });

    // Escuchar cambios futuros (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (cancelled) return;
        setSession(session);
        if (session?.user) {
          const appUser = await buildAppUser(session.user);
          if (!cancelled) {
            setUser(appUser);
            setLoading(false); // ← también aquí
          }
        } else {
          setUser(null);
          setLoading(false); // ← y aquí cuando no hay sesión
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
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
