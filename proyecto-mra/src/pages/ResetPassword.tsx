// src/pages/ResetPassword.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return; }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError('No se pudo actualizar. Intenta de nuevo.');
    else { setMsg('¡Contraseña actualizada! Redirigiendo...'); setTimeout(() => navigate('/login'), 2000); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-primary-purple">Nueva contraseña</h1>
        <input type="password" placeholder="Nueva contraseña" value={password}
          onChange={e => setPassword(e.target.value)} required minLength={6}
          className="border rounded-xl px-4 py-3 focus:outline-none focus:border-primary-gold" />
        <input type="password" placeholder="Confirmar contraseña" value={confirm}
          onChange={e => setConfirm(e.target.value)} required
          className="border rounded-xl px-4 py-3 focus:outline-none focus:border-primary-gold" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {msg && <p className="text-green-600 text-sm">{msg}</p>}
        <button type="submit" className="bg-primary-purple text-white py-3 rounded-xl font-bold hover:bg-purple-900 transition">
          Actualizar contraseña
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;