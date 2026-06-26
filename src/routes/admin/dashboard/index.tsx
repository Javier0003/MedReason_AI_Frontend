import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import MainPanel from '../../../components/main-panel'
import isAuthenticated from '../../../lib/is-authenticated'
import type { Role, User, UserStatus } from '../../../types'
 
export const Route = createFileRoute('/admin/dashboard/')({
  component: RouteComponent,
  beforeLoad: isAuthenticated,
})
 
const initialUsers: User[] = [
  {
    id: "1",
    name: 'Dra. Laura Méndez',
    email: 'laura.mendez@medreason.ai',
    role: 'DOCTOR',
    status: 'Activo',
    lastAccess: 'Hoy, 9:35 AM',
    profession: "Cardiología",
    userImg: "LM"
  },
  {
    id: "2",
    name: 'Carlos Ramírez',
    email: 'carlos.ramirez@medreason.ai',
    role: 'ADMIN',
    status: 'Activo',
    lastAccess: 'Hoy, 6:10 PM',
    profession: "Administrador",
    userImg: "CR"
  },
  {
    id: "3",
    name: 'Dra. Ana Castillo',
    email: 'ana.castillo@medreason.ai',
    role: 'DOCTOR',
    status: 'Pendiente',
    lastAccess: 'Sin acceso reciente',
    profession: "Neurocirugía",
    userImg: "AC"
  },
  {
    id: "4",
    name: 'Miguel Torres',
    email: 'miguel.torres@medreason.ai',
    role: 'DOCTOR',
    status: 'Inactivo',
    lastAccess: 'Hace 8 días',
    profession: "Neumología",
    userImg: "MT"
  },
  {
    id: "5",
    name: 'Dra. Patricia Sáenz',
    email: 'patricia.saenz@medreason.ai',
    role: 'DOCTOR',
    status: 'Activo',
    lastAccess: 'Hoy, 2:15 PM',
    profession: "Oncología",
    userImg: "PS"
  },
]
 
interface ActivityItem {
  texto: string
  tiempo: string
  tipo: 'login' | 'edit' | 'warning'
}
 
const ACTIVIDAD: ActivityItem[] = [
  { texto: 'C. Ramírez modificó permisos de Dr. Gómez', tiempo: '14:22', tipo: 'edit' },
  { texto: 'Nuevo acceso desde Terminal Segura 04',       tiempo: '13:45', tipo: 'login' },
  { texto: 'Intento de acceso no autorizado bloqueado',   tiempo: '12:01', tipo: 'warning' },
  { texto: 'Dra. Méndez cambió contraseña',               tiempo: '11:30', tipo: 'edit' },
  { texto: 'Sesión Admin iniciada - Carlos Ramírez',      tiempo: '10:15', tipo: 'login' },
]
 
function RouteComponent() {
  const [users] = useState<User[]>(initialUsers)
  const [roleFilter, setRoleFilter] = useState<'Todos' | Role>('Todos')
  const [statusFilter, setStatusFilter] = useState<'Todos' | UserStatus>('Todos')
 
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = roleFilter === 'Todos' || user.role === roleFilter
      const matchesStatus = statusFilter === 'Todos' || user.status === statusFilter as unknown
      return matchesRole && matchesStatus
    })
  }, [users, roleFilter, statusFilter])
 
  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.status === 'Activo').length
  const pendingUsers = users.filter((user) => user.status === 'Pendiente').length
 
  const getRoleStyle = (role: Role) => {
    if (role === 'ADMIN') return 'bg-slate-800 text-white'
    if (role === 'DOCTOR') return 'border border-slate-300 text-slate-600'
    return 'bg-violet-50 text-violet-700'
  }
 
  const getStatusStyle = (status: UserStatus) => {
    if (status === 'Activo') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (status === 'Pendiente') return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-slate-100 text-slate-600 border-slate-200'
  }
 
  const getActivityIcon = (tipo: 'login' | 'edit' | 'warning') => {
    if (tipo === 'login') return '🔐'
    if (tipo === 'edit') return '✏️'
    return '⚠️'
  }
 
  return (
    <MainPanel>
      <section className="h-full overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-7xl space-y-6">
 
          {/* Header */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-[#1565d8]">Admin Dashboard</p>
            <h2 className="text-3xl font-bold text-slate-900">Bienvenido</h2>
            <p className="max-w-2xl text-sm text-slate-500">
              Resumen general del sistema, usuarios activos y seguridad global.
            </p>
          </div>
 
          {/* Tarjetas métricas */}
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Usuarios Totales</p>
                  <h3 className="mt-3 text-3xl font-bold text-slate-900">{totalUsers}</h3>
                  <p className="mt-2 text-xs text-slate-400">En el sistema</p>
                </div>
                <span className="text-3xl">👤</span>
              </div>
            </article>
 
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Activos Ahora</p>
                  <h3 className="mt-3 text-3xl font-bold text-emerald-600">{activeUsers}</h3>
                  <p className="mt-2 text-xs text-slate-400">Con acceso activo</p>
                </div>
                <span className="text-3xl">🟢</span>
              </div>
            </article>
 
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Verificación Pendiente</p>
                  <h3 className="mt-3 text-3xl font-bold text-amber-500">{pendingUsers}</h3>
                  <p className="mt-2 text-xs text-slate-400">Esperando confirmar</p>
                </div>
                <span className="text-3xl">⏳</span>
              </div>
            </article>
          </div>
 
          {/* Tabla usuarios */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Usuarios del Sistema</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Estado de acceso y permisos de usuarios.
                </p>
              </div>
 
              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as 'Todos' | Role)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100"
                >
                  <option value="Todos">Todos los roles</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="DOCTOR">Doctor</option>
                </select>
 
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'Todos' | UserStatus)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100"
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="Activo">Activo</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>
 
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full bg-white text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Usuario</th>
                    <th className="px-5 py-4 font-semibold">Rol</th>
                    <th className="px-5 py-4 font-semibold">Estado</th>
                    <th className="px-5 py-4 font-semibold">Última actividad</th>
                    <th className="px-5 py-4 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1565d8]/10 text-sm font-bold text-[#1565d8]">
                            {user.userImg}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleStyle(user.role)}`}>
                          {user.role === 'ADMIN' ? 'Admin' : 'Doctor'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{user.lastAccess}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                            Editar
                          </button>
                          <button className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
 
          {/* Security + Activity */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Global Security */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                🛡️ Seguridad Global
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Anomalías de Login</p>
                    <p className="text-xs text-slate-500">Últimas 24 horas</p>
                  </div>
                  <p className="text-2xl font-bold text-red-500">3</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Sesiones Privilegiadas</p>
                    <p className="text-xs text-slate-500">Todas verificadas</p>
                  </div>
                  <p className="text-2xl font-bold text-emerald-500">12</p>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Intentos Bloqueados</p>
                    <p className="text-xs text-slate-500">Acceso no autorizado</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-500">7</p>
                </div>
              </div>
              <button className="w-full mt-4 rounded-2xl bg-[#1565d8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f4fb3]">
                Ver Reporte Completo
              </button>
            </div>
 
            {/* Recent Activity */}
            <div className="rounded-3xl border border-slate-200 bg-[#0f1729] p-5 shadow-sm">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                📝 Actividad Reciente
              </h3>
              <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
                {ACTIVIDAD.map((item: ActivityItem, i: number) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-white/10">
                    <span className="text-lg shrink-0">{getActivityIcon(item.tipo)}</span>
                    <div className="flex-1">
                      <p className="text-sm text-white/80">{item.texto}</p>
                      <p className="text-xs text-white/40 mt-1">{item.tiempo}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full rounded-2xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold px-4 py-2.5 transition">
                Ver Auditoria Completa
              </button>
            </div>
          </div>
 
        </div>
      </section>
    </MainPanel>
  )
}