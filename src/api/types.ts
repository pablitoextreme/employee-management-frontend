// Tipos que reflejan 1:1 los DTOs del backend (com.polloshermanos.ems.dto.*).
// Mantenerlos sincronizados manualmente: si cambia un record/DTO en el backend,
// hay que actualizar aquí también.

// --- Auth (AuthController) ---

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// AuthResponse: roles vienen con prefijo "ROLE_" (p.ej. "ROLE_ADMIN"), igual que en BD.
export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  username: string;
  roles: string[];
}

// --- Department (DepartmentController) ---

export interface DepartmentResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
}

// --- Employee (EmployeeController) ---

export interface EmployeeRequest {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  jobTitle: string;
  salary: number;
  hireDate: string; // formato ISO date "YYYY-MM-DD"
  departmentId: string;
  active: boolean;
}

export interface EmployeeResponse {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  jobTitle: string;
  salary: number;
  hireDate: string;
  active: boolean;
  department: DepartmentResponse;
}

// Filtros y paginación aceptados por GET /employees
export interface EmployeeSearchParams {
  firstName?: string;
  lastName?: string;
  department?: string;
  page?: number;
  size?: number;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'employeeNumber' | 'hireDate' | 'salary';
  direction?: 'ASC' | 'DESC';
}

// Réplica genérica de PageResponse<T> del backend (Spring Page envuelto a mano).
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Forma del cuerpo de error que devuelven los @ExceptionHandler del backend.
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors: Record<string, string>;
}
