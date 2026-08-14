# MedReason_AI Frontend

Frontend de diagnóstico asistido por IA para el proyecto final MedReason_AI. Construido con React 19, Vite, Tailwind CSS v4, TanStack Router y TanStack Query.

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Redirige a `/auth/login` |
| `/auth/login` | Inicio de sesión (roles Médico y Administrador) |
| `/support` | Centro de Ayuda con guía de uso de toda la aplicación |
| `/admin/dashboard` | Dashboard administrativo: consultas, tokens consumidos, usuarios activos, tasa de errores, actividad por día y distribución de acciones |
| `/admin/medicos` | Gestión de usuarios (médicos y administradores) con activar/desactivar |
| `/admin/Logs` | Auditoría de acciones del sistema (log de auditoría) |
| `/admin/configuracion` | Configuración del modelo IA (modelo, tokens máximos, temperatura, system prompt) y versiones de prompt |
| `/doctor/dashboard` | Dashboard del médico: pacientes, consultas hoy, distribución de riesgos y últimas consultas |
| `/doctor/pacientes` | CRUD de pacientes (crear, editar, eliminar, búsqueda y paginación) |
| `/doctor/consulta` | Creación de consultas con IA e historial paginado con filtros |
| `/doctor/consulta/$id` | Detalle de consulta con diagnóstico renderizado y chatbot Clinical Insight AI |
| `/doctor/historial` | Historial completo de consultas con filtros (fecha, ID de paciente) y exportación a Excel |

## Stack

- **React 19** + **TypeScript**
- **Vite 8** — dev server y build
- **TanStack Router** — routing type-safe con file-based routing y auto code-splitting
- **TanStack Query** — data fetching y caché
- **TanStack Virtual** — listas virtualizadas (tabla de usuarios)
- **Tailwind CSS v4** — estilos utilitarios (plugin `@tailwindcss/vite`)
- **Zustand** — estado global (autenticación)
- **js-cookie** — persistencia de sesión (token y datos del usuario)
- **react-markdown** — renderizado del diagnóstico generado por IA
- **recharts** — gráficas del dashboard administrativo
- **xlsx** — exportación del historial a Excel
- **Font Awesome + Google Fonts** — iconografía y tipografía (Inter, JetBrains Mono, Material Symbols)

## Requisitos

- Node.js 20+ (desarrollado con Node 24)
- Backend corriendo en `http://localhost:3007` (por defecto)

## Variables de entorno

```env
VITE_API_URL=http://localhost:3007
```

## Inicio rápido

```bash
npm install
npm run dev
```

El servidor de desarrollo se abre en `http://localhost:5675` (puerto fijo configurado en `vite.config.ts`).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo en el puerto 5675 |
| `npm run build` | Compila TypeScript y genera assets de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run preview` | Previsualiza el build de producción |

## Estructura

```
src/
├── main.tsx                  # Entry point (Router + QueryClient)
├── routeTree.gen.ts          # Árbol de rutas generado por el plugin de TanStack Router
├── index.css                 # Estilos globales (Tailwind v4)
├── routes/                   # Páginas por ruta (file-based)
│   ├── __root.tsx            # Layout raíz (Outlet + Devtools)
│   ├── index.tsx             # Redirección a /auth/login
│   ├── support.tsx           # Centro de Ayuda
│   ├── auth/login/           # Inicio de sesión
│   ├── admin/
│   │   ├── dashboard/        # Métricas y gráficas del sistema
│   │   ├── medicos/          # Gestión de usuarios
│   │   ├── Logs/             # Log de auditoría
│   │   └── configuracion/    # Configuración del modelo IA y prompts
│   └── doctor/
│       ├── dashboard/        # Panel de control del médico
│       ├── pacientes/        # CRUD de pacientes
│       ├── consulta/
│       │   ├── index.tsx     # Lista + creación de consultas
│       │   └── $id.tsx       # Detalle + chatbot Clinical Insight AI
│       └── historial/        # Historial con exportación a Excel
├── components/               # Componentes compartidos
│   ├── sidebar.tsx           # Navegación lateral según rol
│   ├── main-panel.tsx        # Layout principal (sidebar + header + contenido)
│   ├── user-logo.tsx         # Avatar del usuario en el header
│   └── calendario.tsx        # Calendario del dashboard
├── hooks/                    # Hooks personalizados
├── store/                    # Zustand stores (autenticación)
├── lib/                      # Utilidades (fetchWithToken, isAuthenticated, toast)
├── types/                    # Tipos compartidos
├── constants/                # Constantes
└── assets/                   # Imágenes e iconos SVG
```

