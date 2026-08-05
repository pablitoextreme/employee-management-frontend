import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-slate-600">
      <h1 className="text-2xl font-semibold text-slate-900">404 — Página no encontrada</h1>
      <Link to="/employees" className="font-medium text-indigo-600 hover:underline">
        Volver a empleados
      </Link>
    </div>
  );
}
