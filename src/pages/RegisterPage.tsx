import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../api/client';

// Misma regla que @ValidPassword en el backend: mínimo 8 caracteres,
// al menos una mayúscula, una minúscula y un número. Validar aquí evita
// un viaje de red innecesario para un error que ya se puede detectar en el cliente.
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!PASSWORD_PATTERN.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }

    setLoading(true);
    try {
      // El registro asigna ROLE_USER automáticamente en el backend; no existe
      // forma de auto-registrarse como ADMIN (por diseño, es correcto).
      await register({ username, email, password });
      navigate('/employees', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Crear cuenta</h1>

        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="space-y-1">
          <label htmlFor="username" className="block text-sm font-medium text-slate-700">
            Usuario
          </label>
          <input
            id="username"
            type="text"
            required
            minLength={3}
            maxLength={50}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p className="text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
