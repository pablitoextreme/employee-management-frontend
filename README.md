# Employee Management — Frontend

Frontend en React para [Employee Management API](https://github.com/pablitoextreme/API-REST): login con JWT, rutas protegidas por rol (USER/ADMIN) y CRUD de empleados.

## Características

- Login y registro contra la API (JWT Bearer)
- Rutas protegidas por autenticación y por rol (`ROLE_ADMIN`)
- CRUD de empleados: listado con paginación y filtros, alta, edición y baja (solo ADMIN)
- Selector de departamento poblado desde la API

## Tecnologías

- React 19 + TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS

## Arquitectura

```
src/
  api/          cliente Axios, tipos (DTOs del backend) y llamadas por recurso
  context/      AuthContext: sesión, login/logout, rol
  routes/       guards de rutas protegidas (autenticación / rol)
  components/   layout y navegación compartidos
  pages/        pantallas: login, registro, listado y formulario de empleados
```

## Ejecución local

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si tu API no corre en localhost:8081
npm run dev
```

Requiere el backend (`API_REST`) corriendo y con CORS configurado para el origen de este frontend (`http://localhost:5173` por defecto).

## Build de producción

```bash
npm run build
```

## Despliegue

Pensado para desplegarse en [Vercel](https://vercel.com), con `VITE_API_URL` apuntando a la URL pública del backend en Railway.
