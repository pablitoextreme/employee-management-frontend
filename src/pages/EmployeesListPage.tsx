import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deleteEmployee, listEmployees } from '../api/employees';
import { extractErrorMessage } from '../api/client';
import type { EmployeeResponse, EmployeeSearchParams } from '../api/types';

const PAGE_SIZE = 10;

export function EmployeesListPage() {
  const { isAdmin } = useAuth();

  // Filtros "aplicados": los que realmente se mandan a la API. Se separan de los
  // inputs del formulario para no disparar una petición en cada pulsación de tecla.
  const [appliedFilters, setAppliedFilters] = useState<EmployeeSearchParams>({});
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [departmentInput, setDepartmentInput] = useState('');

  const [page, setPage] = useState(0);
  const [data, setData] = useState<{ content: EmployeeResponse[]; totalPages: number; first: boolean; last: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listEmployees({ ...appliedFilters, page, size: PAGE_SIZE, sortBy: 'lastName', direction: 'ASC' })
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [appliedFilters, page]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setPage(0);
    setAppliedFilters({
      firstName: firstNameInput || undefined,
      lastName: lastNameInput || undefined,
      department: departmentInput || undefined,
    });
  }

  async function handleDelete(employee: EmployeeResponse) {
    if (!confirm(`¿Eliminar a ${employee.firstName} ${employee.lastName}? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteEmployee(employee.id);
      // Recarga forzando un nuevo objeto de filtros para disparar el efecto.
      setAppliedFilters((prev) => ({ ...prev }));
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Empleados</h1>
        {isAdmin && (
          <Link
            to="/employees/new"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Nuevo empleado
          </Link>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <input
          placeholder="Nombre"
          value={firstNameInput}
          onChange={(e) => setFirstNameInput(e.target.value)}
          className="flex-1 min-w-[140px] rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
        <input
          placeholder="Apellido"
          value={lastNameInput}
          onChange={(e) => setLastNameInput(e.target.value)}
          className="flex-1 min-w-[140px] rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
        <input
          placeholder="Departamento"
          value={departmentInput}
          onChange={(e) => setDepartmentInput(e.target.value)}
          className="flex-1 min-w-[140px] rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
        <button type="submit" className="rounded-md border border-slate-300 px-4 py-1.5 text-sm font-medium hover:bg-slate-50">
          Buscar
        </button>
      </form>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Puesto</th>
              <th className="px-4 py-3">Departamento</th>
              <th className="px-4 py-3">Salario</th>
              <th className="px-4 py-3">Estado</th>
              {isAdmin && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="px-4 py-6 text-center text-slate-500">
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && data?.content.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="px-4 py-6 text-center text-slate-500">
                  No se encontraron empleados.
                </td>
              </tr>
            )}
            {!loading &&
              data?.content.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {employee.firstName} {employee.lastName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{employee.email}</td>
                  <td className="px-4 py-3 text-slate-600">{employee.jobTitle}</td>
                  <td className="px-4 py-3 text-slate-600">{employee.department.name}</td>
                  <td className="px-4 py-3 text-slate-600">{employee.salary.toLocaleString('es-ES')} €</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        employee.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {employee.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="space-x-3 px-4 py-3 text-right">
                      <Link to={`/employees/${employee.id}/edit`} className="font-medium text-indigo-600 hover:underline">
                        Editar
                      </Link>
                      <button onClick={() => handleDelete(employee)} className="font-medium text-red-600 hover:underline">
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 text-sm">
          <button
            disabled={data.first}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-slate-600">
            Página {page + 1} de {data.totalPages}
          </span>
          <button
            disabled={data.last}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
