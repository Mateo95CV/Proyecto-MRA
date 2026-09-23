import type { Session } from '@supabase/supabase-js';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  phone: string;
  address: string;
}

export interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<'admin' | 'user'>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name: string; phone: string; address: string }) => Promise<void>;
}
