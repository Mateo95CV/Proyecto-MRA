// src/pages/Register.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '', email: '', password: '', confirmPassword: '',
  });
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState('');
  const { register } = useAuth();
  const navigate      = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.nombre.trim())               e.nombre = 'El nombre es obligatorio';
    if (!formData.email)                        e.email  = 'El correo es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Correo inválido';
    if (!formData.password)                     e.password = 'La contraseña es obligatoria';
    else if (formData.password.length < 6)     e.password = 'Mínimo 6 caracteres';
    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(formData.email, formData.password, formData.nombre);
      setSuccess('¡Cuenta creada! Revisa tu correo para confirmar y luego inicia sesión.');
      setTimeout(() => navigate('/login'), 3500);
    } catch (err: any) {
      const msg = err.message ?? '';
      if (msg.includes('already registered'))
        setErrors({ general: 'Este correo ya está registrado' });
      else
        setErrors({ general: 'Error al registrar. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const field = (name: keyof typeof formData, label: string, type = 'text') => (
    <div>
      <input
        type={type}
        name={name}
        placeholder={label}
        value={formData[name]}
        onChange={handleChange}
        className={`w-full p-4 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded-2xl focus:outline-none focus:border-primary-gold transition`}
      />
      {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-purple to-black flex items-center justify-center px-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary-purple mb-8">
          Crear Cuenta
        </h2>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-6 text-center">
            {success}
          </div>
        )}
        {errors.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 text-center">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {field('nombre',          'Nombre completo')}
          {field('email',           'Correo electrónico', 'email')}
          {field('password',        'Contraseña',         'password')}
          {field('confirmPassword', 'Confirmar contraseña','password')}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-purple hover:bg-primary-gold disabled:bg-gray-400 text-white py-4 rounded-2xl font-semibold transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary-gold font-medium hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
