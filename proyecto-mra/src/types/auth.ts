import type { Session } from '@supabase/supabase-js';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<'admin' | 'user'>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}