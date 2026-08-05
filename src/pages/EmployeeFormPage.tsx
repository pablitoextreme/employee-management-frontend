import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEmployee, getEmployee, updateEmployee } from '../api/employees';
import { listDepartments } from '../api/departments';
import { extractErrorMessage } from '../api/client';
import type { DepartmentResponse, EmployeeRequest } from '../api/types';

const EMPTY_FORM: EmployeeRequest = {
  employeeNumber: '',
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  jobTitle: '',
  salary: 0,
  hireDate: '',
  departmentId: '',
  active: true,
};

export function EmployeeFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = id !== undefined;
  const navigate = useNavigate();

  const [form, setForm] = useState<EmployeeRequest>(EMPTY_FORM);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga los departamentos siempre (para el <select>) y, en modo edición,
  // también el empleado existente para precargar el formulario.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const departmentsPromise = listDepartments();
        if (isEditMode) {
          const [employee, departmentList] = await Promise.all([getEmployee(id!), departmentsPromise]);
          if (cancelled) return;
          setDepartments(departmentList);
          setForm({
            employeeNumber: employee.employeeNumber,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phoneNumber: employee.phoneNumber ?? '',
            jobTitle: employee.jobTitle,
            salary: employee.salary,
            hireDate: employee.hireDate,
            departmentId: employee.department.id,
            active: employee.active,
          });
        } else {
          const departmentList = await departmentsPromise;
          if (cancelled) return;
          setDepartments(departmentList);
          // Preselecciona el primer departamento disponible para no dejar el select vacío.
          setForm((prev) => ({ ...prev, departmentId: departmentList[0]?.id ?? '' }));
        }
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isEditMode]);

  function updateField<K extends keyof EmployeeRequest>(field: K, value: EmployeeRequest[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload: EmployeeRequest = { ...form, phoneNumber: form.phoneNumber || undefined };
      if (isEditMode) await updateEmployee(id!, payload);
      else await createEmployee(payload);
      navigate('/employees', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">Cargando...</p>;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">{isEditMode ? 'Editar empleado' : 'Nuevo empleado'}</h1>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {departments.length === 0 && !error && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          No hay departamentos disponibles. Crea uno en la base de datos antes de dar de alta empleados.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Número de empleado">
            <input
              required
              maxLength={30}
              value={form.employeeNumber}
              onChange={(e) => updateField('employeeNumber', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Puesto">
            <input
              required
              maxLength={100}
              value={form.jobTitle}
              onChange={(e) => updateField('jobTitle', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Nombre">
            <input
              required
              maxLength={100}
              value={form.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Apellidos">
            <input
              required
              maxLength={100}
              value={form.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              maxLength={254}
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Teléfono (opcional)">
            <input
              maxLength={30}
              value={form.phoneNumber}
              onChange={(e) => updateField('phoneNumber', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Salario">
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={form.salary}
              onChange={(e) => updateField('salary', Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Fecha de contratación">
            <input
              required
              type="date"
              value={form.hireDate}
              onChange={(e) => updateField('hireDate', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Departamento">
            <select
              required
              value={form.departmentId}
              onChange={(e) => updateField('departmentId', e.target.value)}
              className="input"
            >
              <option value="" disabled>
                Selecciona un departamento
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estado">
            <select
              value={form.active ? 'true' : 'false'}
              onChange={(e) => updateField('active', e.target.value === 'true')}
              className="input"
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </Field>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
