# MedReason_AI Frontend

Frontend de diagnóstico asistido por IA para el proyecto final MedReason_AI. Construido con React, Vite, Tailwind CSS v4, TanStack Router y TanStack Query.

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/auth/login` | Inicio de sesión |
| `/admin/dashboard` | Dashboard administrativo con métricas del sistema |
| `/admin/medicos` | Gestión de usuarios (médicos y administradores) |
| `/admin/configuracion` | Configuración de modelo IA, parámetros y versiones de prompt |
| `/admin/logs` | Auditoría de acciones del sistema |
| `/doctor/dashboard` | Dashboard del médico: pacientes, consultas recientes, distribución de riesgos |
| `/doctor/pacientes` | CRUD de pacientes |
| `/doctor/consulta` | Creación de consultas con diagnóstico IA e historial paginado |
| `/doctor/consulta/$id` | Detalle de consulta con chatbot integrado |
| `/doctor/historial` | Historial completo de consultas con filtros y exportación a Excel |

## Stack

- **React 19** + **TypeScript**
- **Vite** — dev server y build
- **TanStack Router** — routing type-safe
- **TanStack Query** — data fetching y caché
- **Tailwind CSS v4** — estilos utilitarios
- **Zustand** — estado global (autenticación)
- **js-cookie** — persistencia de sesión

## Requisitos

- Node.js 20+
- Backend corriendo en `http://localhost:3000` (por defecto)

## Variables de entorno

```env
VITE_API_URL=http://localhost:3000
```

## Inicio rápido

```bash
npm install
npm run dev
```

El servidor de desarrollo se abre en el puerto que indique Vite (usualmente `http://localhost:5173`).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila TypeScript y genera assets de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run preview` | Previsualiza el build de producción |

## Estructura

```
src/
├── main.tsx                  # Entry point
├── routes/                   # Páginas por ruta (file-based)
│   ├── auth/login/
│   ├── admin/dashboard/
│   ├── admin/medicos/
│   ├── admin/configuracion/
│   ├── admin/logs/
│   ├── doctor/dashboard/
│   ├── doctor/pacientes/
│   ├── doctor/consulta/
│   │   ├── index.tsx         # Lista + creación
│   │   └── $id.tsx           # Detalle + chatbot
│   └── doctor/historial/
├── components/               # Componentes compartidos
├── store/                    # Zustand stores
├── lib/                      # Utilidades (fetchWithToken, etc.)
├── types/                    # Tipos compartidos
└── constants/                # Constantes
```
