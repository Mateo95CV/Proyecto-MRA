import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const role = login(email, password); // ← guardamos el rol retornado
    console.log(role)

    console.log('¿Es admin?', role === 'admin');

    if (role === 'admin') {
      console.log('Redirigiendo a /admin');
      navigate('/admin');
    } else if (role === 'user'){
      console.log('Redirigiendo a /');
      navigate('/');
    } else {
      setError('Credenciales Invalidas')
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-black flex items-center justify-center">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full">
        <h2 className="text-4xl font-bold text-center text-primary-purple mb-8">Iniciar Sesión</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-primary-gold"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-primary-gold"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-primary-purple hover:bg-primary-gold text-white py-4 rounded-2xl font-semibold transition"
          >
            Entrar
          </button>
        </form>

        <p className="text-center mt-6">
          ¿No tienes cuenta?{' '}
          <a href="/register" className="text-primary-gold font-medium">Regístrate aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Login;