import { useState, useEffect, } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import { AuthContext } from './AuthContextInstance';
import type { AppUser } from '../types/auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Carga el perfil completo desde la tabla profiles
  const loadProfile = async (supaUser: User): Promise<AppUser> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('name, role, phone, address')
      .eq('id', supaUser.id)
      .maybeSingle();

    if (error) console.error('Error cargando perfil:', error);

    return {
      id: supaUser.id,
      email: supaUser.email ?? '',
      name: profile?.name ?? supaUser.email?.split('@')[0] ?? '',
      role: (profile?.role as 'user' | 'admin') ?? 'user',
      phone: profile?.phone ?? '',
      address: profile?.address ?? '',
    };
  };

  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (cancelled) return;

        setSession(newSession);

        if (newSession?.user) {
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

  // Login
  const login = async (email: string, password: string): Promise<'admin' | 'user'> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const appUser = await loadProfile(data.user);
    setUser(appUser);
    return appUser.role;
  };

  // Registro
  const register = async (email: string, password: string, name: string): Promise<void> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
  };

  // Actualizar perfil (name, phone, address)
  const updateProfile = async (data: { name: string; phone: string; address: string }): Promise<void> => {
    if (!user) throw new Error('No hay sesión activa');

    const { error } = await supabase
      .from('profiles')
      .update({
        name: data.name.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
      })
      .eq('id', user.id);

    if (error) throw error;

    // Actualizar estado local inmediatamente
    setUser(prev => prev ? { ...prev, ...data } : prev);
  };

  // Logout
  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};