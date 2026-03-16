import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react'

type User = { name: string; email: string; role?: 'user' | 'admin' } | null;

interface AuthContextType {
  user: User;
  login: (email: string, password: string, name?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);

  // Cargar usuario desde localStorage al iniciar la app
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
      } catch (error) {
        console.error('Error al parsear usuario de localStorage:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (email: string, password: string, name: string = email.split('@')[0]): 'admin' | 'user' | null => {
    // Validación básica
    if (!email || !password) {
      console.warn('Email o contraseña vacíos');
      return null;
    }

    // Crear datos del usuario
    const userData: User = {
      name,
      email,
      role: email === 'admin@mra.com' ? 'admin' : 'user',
    };

    // Guardar en estado y localStorage
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    // Retornar el rol para que el componente que llama sepa qué hacer
    return userData.role;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};