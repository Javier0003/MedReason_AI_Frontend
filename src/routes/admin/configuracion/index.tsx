import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import isAuthenticated from '../../../lib/is-authenticated'
import MainPanel from '../../../components/main-panel'
import type { Role, User, UserStatus } from '../../../types'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/admin/configuracion/')({
  component: RouteComponent,
  beforeLoad: isAuthenticated
})

const initialUsers: User[] = [
  {
    id: "1",
    name: 'Dra. Laura Méndez',
    email: 'laura.mendez@medreason.ai',
    role: 'DOCTOR',
    status: 'Activo',
    lastAccess: 'Hoy, 9:35 AM',
    profession: "qwe",
    userImg: "qwe"
  },
  {
    id: "2",
    name: 'Carlos Ramírez',
    email: 'carlos.ramirez@medreason.ai',
    role: 'ADMIN',
    status: 'Activo',
    lastAccess: 'Ayer, 6:10 PM',
    profession: "qwe",
    userImg: "qwe"
  },
  {
    id: "3",
    name: 'Dra. Ana Castillo',
    email: 'ana.castillo@medreason.ai',
    role: 'DOCTOR',
    status: 'Pendiente',
    lastAccess: 'Sin acceso reciente',
    profession: "qwe",
    userImg: "qwe"
  },
  {
    id: "4",
    name: 'Miguel Torres',
    email: 'miguel.torres@medreason.ai',
    role: 'DOCTOR',
    status: 'Inactivo',
    lastAccess: 'Hace 8 días',
    profession: "qwe",
    userImg: "qwe"
  },
]

function RouteComponent() {
  // const { isPending, data, error } = useQuery({
  //   queryKey: ['userData'],
  //   queryFn: () => {
  //     return initialUsers
  //   }
  // })

  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'Todos' | Role>('Todos')
  const [statusFilter, setStatusFilter] = useState<'Todos' | UserStatus>('Todos')
  const [showModal, setShowModal] = useState(false)
  const [newUser, setNewUser] = useState<{
    name: string
    email: string
    role: Role
    status: UserStatus
  }>({
    name: '',
    email: '',
    role: 'DOCTOR',
    status: 'Activo',
  })

  // se pedira al backend
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = roleFilter === 'Todos' || user.role === roleFilter
      const matchesStatus = statusFilter === 'Todos' || user.status === statusFilter as unknown

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, roleFilter, statusFilter])


  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.status === 'Activo').length
  const pendingUsers = users.filter((user) => user.status === 'Pendiente').length
  const inactiveUsers = users.filter((user) => user.status === 'Inactivo').length

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) return

    const user: User = {
      id: `${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      lastAccess: 'Nuevo usuario',
      profession: "smth",
      userImg: "qaweb"
    }

    setUsers((currentUsers) => [user, ...currentUsers])
    setNewUser({
      name: '',
      email: '',
      role: 'DOCTOR',
      status: 'Activo',
    })
    setShowModal(false)
  }

  const changeStatus = (id: string, status: UserStatus) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === id ? { ...user, status } : user,
      ),
    )
  }

  const deleteUser = (id: string) => {
    setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id))
  }

  // se pedira al backend

  const getStatusStyle = (status: UserStatus) => {
    if (status === 'Activo') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    if (status === 'Pendiente') return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-slate-100 text-slate-600 border-slate-200'
  }

  const getRoleStyle = (role: Role) => {
    if (role === 'ADMIN') return 'bg-blue-50 text-blue-700'
    if (role === 'DOCTOR') return 'bg-cyan-50 text-cyan-700'
    return 'bg-violet-50 text-violet-700'
  }

  return (
    <MainPanel>
      <section className="h-full overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1565d8]">Admin settings</p>
              <h2 className="mt-1 text-3xl font-bold text-slate-900">
                Gestión de usuarios
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Administra los usuarios del sistema, sus roles, accesos y estado dentro de MedReason AI.
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="rounded-2xl bg-[#1565d8] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f4fb3]"
            >
              + Agregar usuario
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Usuarios totales</p>
              <h3 className="mt-3 text-3xl font-bold text-slate-900">{totalUsers}</h3>
              <p className="mt-2 text-xs text-slate-400">Registrados en el sistema</p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Activos</p>
              <h3 className="mt-3 text-3xl font-bold text-emerald-600">{activeUsers}</h3>
              <p className="mt-2 text-xs text-slate-400">Con acceso habilitado</p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Pendientes</p>
              <h3 className="mt-3 text-3xl font-bold text-amber-500">{pendingUsers}</h3>
              <p className="mt-2 text-xs text-slate-400">Esperando confirmación</p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Inactivos</p>
              <h3 className="mt-3 text-3xl font-bold text-slate-500">{inactiveUsers}</h3>
              <p className="mt-2 text-xs text-slate-400">Sin acceso actual</p>
            </article>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">System Users</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Lista general de usuarios y permisos.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por nombre o correo"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100 sm:w-72"
                />

                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value as 'Todos' | Role)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100"
                >
                  <option value="Todos">Todos los roles</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Soporte">Soporte</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'Todos' | UserStatus)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100"
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="Activo">Activo</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full border-collapse bg-white text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Usuario</th>
                    <th className="px-5 py-4 font-semibold">Rol</th>
                    <th className="px-5 py-4 font-semibold">Estado</th>
                    <th className="px-5 py-4 font-semibold">Último acceso</th>
                    <th className="px-5 py-4 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1565d8]/10 text-sm font-bold text-[#1565d8]">
                            {user.name
                              .split(' ')
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleStyle(user.role)}`}>
                          {user.role}
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
                          {user.status !== 'Activo' && (
                            <button
                              onClick={() => changeStatus(user.id, 'Activo')}
                              className="rounded-xl border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                            >
                              Activar
                            </button>
                          )}

                          {user.status !== 'Inactivo' && (
                            <button
                              onClick={() => changeStatus(user.id, 'Inactivo')}
                              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                              Desactivar
                            </button>
                          )}

                          <button
                            onClick={() => deleteUser(user.id)}
                            className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                        No se encontraron usuarios con esos filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Agregar usuario</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Completa los datos para registrar un nuevo acceso.
                  </p>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-full px-3 py-1 text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  ×
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Nombre completo</label>
                  <input
                    value={newUser.name}
                    onChange={(event) =>
                      setNewUser((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Ej: Dra. María López"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Correo electrónico</label>
                  <input
                    value={newUser.email}
                    onChange={(event) =>
                      setNewUser((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="usuario@medreason.ai"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Rol</label>
                    <select
                      value={newUser.role}
                      onChange={(event) =>
                        setNewUser((current) => ({
                          ...current,
                          role: event.target.value as Role,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="Administrador">Administrador</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Soporte">Soporte</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700">Estado</label>
                    <select
                      value={newUser.status}
                      onChange={(event) =>
                        setNewUser((current) => ({
                          ...current,
                          status: event.target.value as UserStatus,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#1565d8] focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleAddUser}
                  className="rounded-2xl bg-[#1565d8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f4fb3]"
                >
                  Guardar usuario
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </MainPanel>
  )
}