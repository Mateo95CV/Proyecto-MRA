// src/context/AuthContext.tsx  (versión corregida)

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import { AuthContext } from './AuthContextInstance';
import type { AppUser } from '../types/auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para cargar el perfil (separada)
  const loadProfile = async (supaUser: User): Promise<AppUser> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', supaUser.id)
      .maybeSingle();

    if (error) console.error('Error cargando perfil:', error);

    return {
      id: supaUser.id,
      email: supaUser.email ?? '',
      name: profile?.name ?? supaUser.email?.split('@')[0] ?? '',
      role: (profile?.role as 'user' | 'admin') ?? 'user',
    };
  };

  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      // 1. Obtener sesión inicial (rápido, lee de localStorage)
      const { data: { session } } = await supabase.auth.getSession();

      if (cancelled) return;

      setSession(session);

      if (session?.user) {
        const appUser = await loadProfile(session.user);
        if (!cancelled) setUser(appUser);
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    initializeAuth();

    // 2. Listener de cambios (SIN await dentro del callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (cancelled) return;

        setSession(newSession);

        if (newSession?.user) {
          // Cargamos perfil SIN bloquear el callback
          loadProfile(newSession.user).then((appUser) => {
            if (!cancelled) {
              setUser(appUser);
              setLoading(false);
            }
          });
        } else {
          setUser(null);
          setLoading(false);
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

    const appUser = await loadProfile(data.user);
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