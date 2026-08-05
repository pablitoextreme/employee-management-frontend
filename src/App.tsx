import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EmployeesListPage } from './pages/EmployeesListPage';
import { EmployeeFormPage } from './pages/EmployeeFormPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider dentro del Router: el logout automático por 401 usa useNavigate,
          que solo funciona dentro del contexto de BrowserRouter. */}
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas que solo requieren estar autenticado (USER o ADMIN) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/employees" element={<EmployeesListPage />} />

              {/* Rutas que además requieren ROLE_ADMIN, anidadas con su propio guard */}
              <Route element={<ProtectedRoute requireRole="ROLE_ADMIN" />}>
                <Route path="/employees/new" element={<EmployeeFormPage />} />
                <Route path="/employees/:id/edit" element={<EmployeeFormPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/employees" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
