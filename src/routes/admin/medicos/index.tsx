import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useRef } from 'react'
import isAuthenticated from '../../../lib/is-authenticated'
import MainPanel from '../../../components/main-panel'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import fetchWithToken from '../../../lib/fetch-with-token'

export const Route = createFileRoute('/admin/medicos/')({
  component: RouteComponent,
  beforeLoad: isAuthenticated
})

type Usuario = {
  id: number
  nombre: string
  email: string
  rol: 'ADMIN' | 'DOCTOR'
  activo: boolean
  creadoEn: string
}

type Rol = 'ADMIN' | 'DOCTOR'

const STATUS_CONFIG = {
  activo: { label: 'Activo', classes: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  inactivo: { label: 'Inactivo', classes: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
}

function RouteComponent() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [rolFilter, setRolFilter] = useState('Todos')
  const [estadoFilter, setEstadoFilter] = useState('Todos')
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-usuarios'],
    queryFn: async () => {
      const res = await fetchWithToken<{ usuarios: Usuario[] }>('/api/admin/usuarios')
      if (!res.success) throw new Error(res.error || 'Error al obtener usuarios')
      return res.data!.usuarios
    },
  })

  const usuarios = data ?? []

  const usuariosFiltrados = useMemo(() =>
    usuarios.filter(u => {
      const matchSearch = u.nombre.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase())
      const matchRol = rolFilter === 'Todos' || u.rol === rolFilter
      const matchEstado = estadoFilter === 'Todos' ||
        (estadoFilter === 'ACTIVO' && u.activo) ||
        (estadoFilter === 'INACTIVO' && !u.activo)
      return matchSearch && matchRol && matchEstado
    }), [usuarios, search, rolFilter, estadoFilter]
  )

  const scrollRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: usuariosFiltrados.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 54,
    overscan: 10,
  })
  const rows = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  const totalActivos = usuarios.filter(u => u.activo).length

  const inicales = (nombre: string) =>
    nombre.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const crearUsuario = async (data: { nombre: string; email: string; password?: string; rol: Rol }, hideToast?: boolean) => {
    const res = await fetchWithToken<{ usuario: Usuario }>('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
      hideToastOnError: hideToast,
    })
    if (!res.success) throw new Error(res.error || 'Error al crear usuario')
    queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] })
    return res.data!.usuario
  }

  const actualizarUsuario = async (id: number, data: { nombre?: string; email?: string; rol?: Rol; activo?: boolean }, hideToast?: boolean) => {
    const res = await fetchWithToken<{ usuario: Usuario }>(`/api/admin/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
      hideToastOnError: hideToast,
    })
    if (!res.success) throw new Error(res.error || 'Error al actualizar usuario')
    queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] })
    return res.data!.usuario
  }

  const headerContent = (
    <div className="flex flex-1 items-center justify-between w-full">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Usuarios del Sistema</h1>
        <p className="text-xs text-slate-500 mt-0.5">Gestión de médicos y administradores del sistema.</p>
      </div>
    </div>
  )

  return (
    <MainPanel headerContent={headerContent}>
      <section className="space-y-6 p-6">


        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 mb-1">Total Usuarios</p>
            <p className="text-[28px] font-bold text-slate-900">{usuarios.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">En el sistema</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 mb-1">Usuarios Activos</p>
            <p className="text-[28px] font-bold text-emerald-600">{totalActivos}</p>
            <p className="text-[11px] text-slate-400 mt-1">Disponibles</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 mb-1">Médicos (DOCTOR)</p>
            <p className="text-[28px] font-bold text-blue-600">{usuarios.filter(u => u.rol === 'DOCTOR').length}</p>
            <p className="text-[11px] text-slate-400 mt-1">Registrados</p>
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm flex flex-col overflow-hidden h-[600px]">

          {/* Filtros y Acción */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-4">
            <div className="grid grid-cols-3 gap-4 flex-1">
              <div className="relative col-span-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-[15px] h-[15px]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/></svg>
                </span>
                <input
                  aria-label="Buscar por nombre o email"
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1565d8] focus:ring-2 focus:ring-[#1565d8]/10 transition-colors"
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[11px]">
                  <i className="fa-solid fa-xmark"></i>
                </button>
                )}
              </div>

              <div className="col-span-1">
                <select
                  aria-label="Filtrar por rol"
                  value={rolFilter}
                  onChange={e => setRolFilter(e.target.value)}
                  className="w-full h-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 outline-none focus:border-[#1565d8] focus:ring-2 focus:ring-[#1565d8]/10 cursor-pointer"
                >
                  <option value="Todos">Todos los roles</option>
                  <option value="DOCTOR">Médico</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="col-span-1">
                <select
                  aria-label="Filtrar por estado"
                  value={estadoFilter}
                  onChange={e => setEstadoFilter(e.target.value)}
                  className="w-full h-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 outline-none focus:border-[#1565d8] focus:ring-2 focus:ring-[#1565d8]/10 cursor-pointer"
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMostrarFormulario(true)}
              className="px-5 py-2 flex items-center justify-center text-[13px] font-semibold text-white bg-[#1565d8] rounded-lg hover:bg-[#0f56bd] transition-colors shadow-sm shrink-0"
            >
              + Nuevo Usuario
            </button>
          </div>

          {/* Tabla */}
          {/* Header fijo (fuera del scroll) */}
          <div className="grid grid-cols-[1fr_120px_120px_120px_180px] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 bg-slate-50/80 border-b border-slate-100">
            <span>Usuario</span>
            <span>Rol</span>
            <span>Estado</span>
            <span>Registro</span>
            <span>Acciones</span>
          </div>
          <div ref={scrollRef} className="overflow-auto flex-1 min-h-0">
            <div style={{ height: `${totalSize}px`, position: 'relative' }}>
              {isLoading ? (
                <div className="px-5 py-10 text-center text-[13px] text-slate-400">Cargando usuarios...</div>
              ) : usuariosFiltrados.length === 0 ? (
                <div className="px-5 py-10 text-center text-[13px] text-slate-400">No se encontraron usuarios</div>
              ) : rows.map(row => {
                const u = usuariosFiltrados[row.index]
                const s = u.activo ? STATUS_CONFIG.activo : STATUS_CONFIG.inactivo
                return (
                  <div
                    key={u.id}
                    className="absolute left-0 right-0 grid grid-cols-[1fr_120px_120px_120px_180px] px-5 items-center hover:bg-slate-50/60 transition-colors border-b border-slate-100"
                    style={{ height: `${row.size}px`, transform: `translateY(${row.start}px)` }}
                  >
                    <div className="flex items-center gap-2.5 cursor-pointer py-2" onClick={() => setUsuarioSeleccionado(u)}>
                      <div className="w-8 h-8 rounded-full bg-[#1565d8]/10 text-[#1565d8] flex items-center justify-center text-[11px] font-bold shrink-0">
                        {inicales(u.nombre)}
                      </div>
                      <div className="truncate min-w-0">
                        <p className="text-[13px] font-semibold text-slate-700 truncate">{u.nombre}</p>
                        <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${
                        u.rol === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {u.rol === 'ADMIN' ? 'ADMIN' : 'MÉDICO'}
                      </span>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.classes}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>
                    <div className="text-[13px] text-slate-500">
                      {new Date(u.creadoEn).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditando(u)}
                        className="text-[11px] font-semibold text-[#1565d8] hover:text-[#0f56bd] px-2 py-1 rounded border border-[#1565d8]/30 hover:bg-[#1565d8]/5 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={async () => { await actualizarUsuario(u.id, { activo: !u.activo }, false) }}
                        className={`text-[11px] font-semibold px-2 py-1 rounded border transition-colors ${
                          u.activo
                            ? 'text-red-500 border-red-200 hover:bg-red-50'
                            : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 shrink-0">
            <p className="text-[11px] text-slate-400">
              Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
            </p>
          </div>
        </div>

      </section>

      {/* Modal Detalle */}
      {usuarioSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)] w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-[15px] font-bold text-slate-800">Información del Usuario</h2>
              <button
                type="button"
                onClick={() => setUsuarioSeleccionado(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors text-lg"
              >
                  <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-[#1565d8]/10 text-[#1565d8] flex items-center justify-center text-[20px] font-bold">
                  {inicales(usuarioSeleccionado.nombre)}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-slate-900">{usuarioSeleccionado.nombre}</p>
                  <p className="text-[13px] text-slate-500 mt-0.5 capitalize">{usuarioSeleccionado.rol.toLowerCase()}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400 mb-1">Email</p>
                  <p className="text-[13px] text-slate-700">{usuarioSeleccionado.email}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400 mb-1">Registro</p>
                  <p className="text-[13px] text-slate-700">{new Date(usuarioSeleccionado.creadoEn).toLocaleString()}</p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400 mb-2">Estado</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    usuarioSeleccionado.activo ? STATUS_CONFIG.activo.classes : STATUS_CONFIG.inactivo.classes
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      usuarioSeleccionado.activo ? STATUS_CONFIG.activo.dot : STATUS_CONFIG.inactivo.dot
                    }`} />
                    {usuarioSeleccionado.activo ? STATUS_CONFIG.activo.label : STATUS_CONFIG.inactivo.label}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-6 pb-5">
              <button
                type="button"
                onClick={() => setUsuarioSeleccionado(null)}
                className="w-full h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-semibold rounded-lg transition-colors"
              >Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Usuario */}
      {mostrarFormulario && (
        <FormularioUsuario
          onClose={() => setMostrarFormulario(false)}
          onSubmit={async (datos) => {
            await crearUsuario(datos, true)
            setMostrarFormulario(false)
          }}
        />
      )}

      {/* Modal Editar Usuario */}
      {editando && (
        <FormularioUsuario
          usuario={editando}
          onClose={() => setEditando(null)}
          onSubmit={async (datos) => {
            await actualizarUsuario(editando.id, datos, true)
            setEditando(null)
          }}
        />
      )}

    </MainPanel>
  )
}

function FormularioUsuario({
  usuario,
  onClose,
  onSubmit,
}: {
  usuario?: Usuario
  onClose: () => void
  onSubmit: (data: { nombre: string; email: string; password?: string; rol: Rol }) => Promise<void>
}) {
  const [nombre, setNombre] = useState(usuario?.nombre ?? '')
  const [email, setEmail] = useState(usuario?.email ?? '')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState<Rol>(usuario?.rol ?? 'DOCTOR')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!nombre || !email) {
      setError('Nombre y email son obligatorios')
      return
    }
    if (!usuario && !password) {
      setError('La contraseña es obligatoria')
      return
    }
    setLoading(true)
    try {
      const body: any = { nombre, email, rol }
      if (password) body.password = password
      await onSubmit(body)
    } catch (e: any) {
      setError(e.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-bold text-slate-800">
            {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button type="button" onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 text-lg">
                  <i className="fa-solid fa-xmark"></i>
                </button>
        </div>
        <div className="px-6 py-5 space-y-6">
          <fieldset>
            <legend className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-100 pb-2 w-full">
              Información Personal
            </legend>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400 mb-1" htmlFor="form-nombre">Nombre</label>
                <input id="form-nombre" type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] focus:outline-none focus:border-[#1565d8]" />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400 mb-1" htmlFor="form-email">Email</label>
                <input id="form-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] focus:outline-none focus:border-[#1565d8]" />
              </div>
            </div>
          </fieldset>
          
          <fieldset>
            <legend className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-100 pb-2 w-full">
              Detalles de Cuenta
            </legend>
            <div className="flex gap-4">
              {!usuario && (
                <div className="flex-1">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400 mb-1" htmlFor="form-password">Contraseña</label>
                  <input id="form-password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] focus:outline-none focus:border-[#1565d8]" />
                </div>
              )}
              <div className="flex-1">
                <label className="block text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400 mb-1" htmlFor="form-rol">Rol</label>
                <select id="form-rol" value={rol} onChange={e => setRol(e.target.value as Rol)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] focus:outline-none focus:border-[#1565d8]">
                  <option value="DOCTOR">Médico</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
          </fieldset>

          {error && <p className="text-[13px] text-red-500 font-semibold">{error}</p>}
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-semibold rounded-lg transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="flex-1 h-10 bg-[#1565d8] hover:bg-[#0f56bd] text-white text-[13px] font-semibold rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Guardando...' : usuario ? 'Guardar Cambios' : 'Crear Usuario'}
          </button>
        </div>
      </div>
    </div>
  )
}