import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import MainPanel from '../../../components/main-panel.tsx'
import isAuthenticated from '../../../lib/is-authenticated.ts'
import { useQuery } from '@tanstack/react-query'
import fetchWithToken from '../../../lib/fetch-with-token.ts'

export const Route = createFileRoute('/admin/Logs/')({
  component: RouteComponent,
  beforeLoad: isAuthenticated
})

type AuditAction =
  | 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
  | 'LOGIN' | 'LOGOUT'
  | 'EXPORT'
  | 'ERROR' | 'AUTH_FAILED'
  | 'CONSULTA_AI'

const ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: 'CREAR',
  READ: 'LEER',
  UPDATE: 'ACTUALIZAR',
  DELETE: 'ELIMINAR',
  LOGIN: 'INICIO SESIÓN',
  LOGOUT: 'CIERRE SESIÓN',
  EXPORT: 'EXPORTAR',
  ERROR: 'ERROR',
  AUTH_FAILED: 'AUTENTICACIÓN FALLIDA',
  CONSULTA_AI: 'CONSULTA IA',
}

const ACTION_COLORS: Record<AuditAction, string> = {
  CREATE: 'bg-emerald-100 text-emerald-700',
  READ: 'bg-sky-100 text-sky-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-green-100 text-green-700',
  LOGOUT: 'bg-orange-100 text-orange-700',
  EXPORT: 'bg-purple-100 text-purple-700',
  ERROR: 'bg-rose-100 text-rose-700',
  AUTH_FAILED: 'bg-yellow-100 text-yellow-700',
  CONSULTA_AI: 'bg-indigo-100 text-indigo-700',
}

type AuditLogEntry = {
  id: number
  userId: number
  accion: AuditAction
  entidad: string
  entidadId: number | null
  detalle: string
  createdAt: string
  user: { id: number; nombre: string; email: string } | null
}

type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const getVisiblePages = (current: number, total: number) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

function RouteComponent() {
  const [pagina, setPagina] = useState(1)
  const [usuarioInput, setUsuarioInput] = useState('')
  const [usuario, setUsuario] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setUsuario(usuarioInput)
      setPagina(1)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [usuarioInput])

  const [fecha, setFecha] = useState('')
  const [tipoAccion, setTipoAccion] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['logs', pagina, usuario, fecha, tipoAccion],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(pagina), pageSize: '10' })
      if (usuario) params.set('usuario', usuario)
      if (fecha) params.set('fecha', fecha)
      if (tipoAccion) params.set('tipoAccion', tipoAccion)

      const res = await fetchWithToken<PaginatedResponse<AuditLogEntry>>(
        `/api/admin/logs?${params}`
      )

      if (!res.success) {
        throw new Error(res.error || 'Error fetching logs')
      }

      return res.data
    },
  })

  const totalPaginas = data?.totalPages ?? 1

  const headerContent = (
    <div className="flex flex-1 items-center justify-between w-full">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Logs de Auditoría</h1>
        <p className="text-xs text-slate-500 mt-0.5">Trazabilidad de acciones realizadas en el sistema.</p>
      </div>
    </div>
  )

  return (
    <MainPanel headerContent={headerContent}>
      <div className="p-6 space-y-6">

        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          <input
            aria-label="Filtrar por usuario"
            type="text"
            placeholder="Filtrar por usuario..."
            value={usuarioInput}
            onChange={e => setUsuarioInput(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1565d8] w-48"
          />
          <input
            aria-label="Filtrar por fecha"
            type="date"
            value={fecha}
            onChange={e => { setFecha(e.target.value); setPagina(1) }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1565d8]"
          />
          <select
            aria-label="Filtrar por tipo de acción"
            value={tipoAccion}
            onChange={e => { setTipoAccion(e.target.value); setPagina(1) }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1565d8]"
          >
            <option value="">Todas las acciones</option>
            {(Object.keys(ACTION_LABELS) as AuditAction[]).map(a => (
              <option key={a} value={a}>{ACTION_LABELS[a]}</option>
            ))}
          </select>
        </div>

        {/* Tabla */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] overflow-hidden">
          <div className="overflow-auto h-[500px]">
            <table className="w-full">
              <thead className="bg-slate-50/80">
                <tr>
                  {[{ label: 'Usuario', w: 'w-[200px]' }, { label: 'Acción', w: 'w-[200px]' }, { label: 'Entidad', w: 'w-[140px]' }, { label: 'Detalle', w: 'w-auto' }, { label: 'Fecha', w: 'w-[170px]' }].map(c => (
                    <th key={c.label} className={`text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 ${c.w}`}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-[13px] text-slate-400">
                      Cargando logs...
                    </td>
                  </tr>
                ) : !data || data.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-[13px] text-slate-400">
                      No se encontraron logs.
                    </td>
                  </tr>
                ) : data.data.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-2.5 w-[200px] truncate">
                      <span className="text-[13px] font-semibold text-slate-700">
                        {log.user?.nombre ?? (log.accion === 'AUTH_FAILED' ? 'Usuario No Identificado' : 'Sistema')}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2">{log.user?.email ?? ''}</span>
                    </td>
                    <td className="px-5 py-2.5 w-[200px]">
                      <span className={`w-full flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${ACTION_COLORS[log.accion] ?? 'bg-slate-100 text-slate-500'}`}>
                        {ACTION_LABELS[log.accion] ?? log.accion}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-[13px] text-slate-500 w-[140px] truncate">
                      {log.entidad}{log.entidadId != null ? ` #${log.entidadId}` : ''}
                    </td>
                    <td className="px-5 py-2.5 text-[13px] text-slate-500 truncate whitespace-nowrap overflow-hidden max-w-0">
                      {log.detalle}
                    </td>
                    <td className="px-5 py-2.5 text-[12px] text-slate-400 whitespace-nowrap w-[170px]">
                      {new Date(log.createdAt).toLocaleString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 shrink-0">
            <p className="text-[11px] text-slate-400">
              Mostrando {data ? data.data.length : 0} de {data?.total ?? 0} logs
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >‹</button>
              {getVisiblePages(pagina, totalPaginas).map((n, idx) => (
                typeof n === 'number' ? (
                  <button
                    type="button"
                    key={`page-${n}`}
                    onClick={() => setPagina(n)}
                    className={`w-7 h-7 flex items-center justify-center rounded text-[12px] font-semibold transition-colors ${
                      n === pagina
                        ? 'bg-[#1565d8] text-white'
                        : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >{n}</button>
                ) : (
                  <span key={`ellipsis-${idx}`} className="w-7 h-7 flex items-center justify-center text-slate-400 text-[12px] font-bold">...</span>
                )
              ))}
              <button
                type="button"
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >›</button>
            </div>
          </div>
        </div>
      </div>
    </MainPanel>
  )
}
