import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();
  
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');

// Esto es para la recuperacion de contraseña
const handleReset = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    setResetMsg('Revisa tu correo, te enviamos el enlace de recuperación.');
  } catch (err: any) {
    setError('No se pudo enviar el correo. Verifica la dirección.');
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const role = await login(email, password);
      navigate(role === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      const msg = err.message ?? '';
      if (msg.includes('Invalid login')) setError('Correo o contraseña incorrectos');
      else if (msg.includes('Email not confirmed')) setError('Debes confirmar tu correo antes de entrar');
      else setError('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-black flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full">
        <h2 className="text-4xl font-bold text-center text-primary-purple mb-8">Iniciar Sesión</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-primary-gold"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-primary-gold"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-purple hover:bg-primary-gold disabled:bg-gray-400 text-white py-4 rounded-2xl font-semibold transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary-gold font-medium hover:underline">
            Regístrate aquí
          </Link>
        </p>
        <button
          type="button"
          onClick={() => { setShowReset(true); setError(''); }}
          className="text-sm text-primary-purple hover:underline mt-2 block mx-auto"
        >
          ¿Olvidaste tu contraseña?
        </button>
        {/* Aca va el formulario de recuperacion de contraseña */}
        {showReset && (
        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-primary-purple">Recuperar contraseña</h2>
          <input
            type="email"
            placeholder="Tu correo registrado"
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            className="border rounded-xl px-4 py-3 focus:outline-none focus:border-primary-gold"
            required
          />
          {resetMsg && <p className="text-green-600 text-sm">{resetMsg}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="bg-primary-purple text-white py-3 rounded-xl font-bold">
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
          <button type="button" onClick={() => setShowReset(false)} className="text-sm text-gray-500 hover:underline">
            Volver al inicio de sesión
          </button>
        </form>
      )}
      </div>
    </div>
  );
};

export default Login;
