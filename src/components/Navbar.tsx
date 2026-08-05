import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/employees" className="font-semibold text-slate-900">
          Employee Management
        </Link>
        {user && (
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>
              {user.username}
              {isAdmin && (
                <span className="ml-2 rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                  ADMIN
                </span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
