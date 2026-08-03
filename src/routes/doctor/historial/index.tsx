import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import MainPanel from '../../../components/main-panel'
import isAuthenticated from '../../../lib/is-authenticated'
import fetchWithToken from '../../../lib/fetch-with-token'
import * as XLSX from 'xlsx'

export const Route = createFileRoute('/doctor/historial/')({
  component: RouteComponent,
  beforeLoad: isAuthenticated,
})

type ConsultaEntry = {
  id: number
  pacienteId: number
  input: string
  output: string | unknown
  nivelRiesgo: string
  modelo: string
  tokens: number
  createdAt: string
  completed: string | null
  paciente: { id: number; nombre: string; documento: string }
  doctor: { id: number; nombre: string; email: string }
}

type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const RIESGO_COLORS: Record<string, string> = {
  Alto: 'bg-rose-100 text-rose-700',
  Medio: 'bg-amber-100 text-amber-700',
  Bajo: 'bg-emerald-100 text-emerald-700',
}

function RouteComponent() {
  const navigate = useNavigate()
  const [pagina, setPagina] = useState(1)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [pacienteSearch, setPacienteSearch] = useState('')
  const [exportando, setExportando] = useState(false)

  const pageSize = 10

  const params = new URLSearchParams({ page: String(pagina), pageSize: String(pageSize), all: 'true' })
  if (fechaInicio) params.set('fechaInicio', fechaInicio)
  if (fechaFin) params.set('fechaFin', fechaFin)
  if (pacienteSearch) params.set('pacienteId', pacienteSearch)

  const { data, isLoading } = useQuery({
    queryKey: ['historial', pagina, fechaInicio, fechaFin, pacienteSearch],
    queryFn: async () => {
      const res = await fetchWithToken<PaginatedResponse<ConsultaEntry>>(
        `/api/consulta/historial?${params.toString()}`
      )
      if (!res.success || !res.data) throw new Error(res.error || 'Error al obtener historial')
      return res.data
    },
    retry: false,
  })

  const exportToExcel = async () => {
    if (exportando) return
    setExportando(true)
    try {
      const paramsTodos = new URLSearchParams({ page: '1', pageSize: '100000', all: 'true' })
      if (fechaInicio) paramsTodos.set('fechaInicio', fechaInicio)
      if (fechaFin) paramsTodos.set('fechaFin', fechaFin)
      if (pacienteSearch) paramsTodos.set('pacienteId', pacienteSearch)

      const res = await fetchWithToken<PaginatedResponse<ConsultaEntry>>(
        `/api/consulta/historial?${paramsTodos.toString()}`
      )
      if (!res.success || !res.data) throw new Error(res.error || 'Error al obtener historial')
      const registros = res.data.data
      if (!registros.length) return

      const rows = registros.map(c => ({
        ID: c.id,
        Paciente: c.paciente.nombre,
        Documento: c.paciente.documento,
        Médico: c.doctor.nombre,
        Síntomas: c.input,
        Diagnóstico: typeof c.output === 'string' ? c.output : JSON.stringify(c.output),
        Riesgo: c.nivelRiesgo,
        Modelo: c.modelo,
        Tokens: c.tokens,
        Estado: c.completed ? 'Completada' : 'Ongoing',
        Fecha: new Date(c.createdAt).toLocaleDateString('es-ES'),
      }))
      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Historial')
      XLSX.writeFile(wb, `historial_consultas_${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch (e) {
      console.log((e as Error).message)
    } finally {
      setExportando(false)
    }
  }

  return (
    <MainPanel>
      <div className="flex flex-col h-full min-h-0">
        <div className="flex items-center justify-between mb-1 shrink-0">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900">Historial de Consultas</h1>
            <p className="text-[13px] text-slate-400 mt-0.5">Todas las consultas realizadas en el sistema.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4 shrink-0">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-1.5">Total de Consultas</p>
            <p className="text-[32px] font-bold text-slate-900 leading-none">{data?.total?.toLocaleString() ?? '—'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-1.5">Página Actual</p>
            <p className="text-[32px] font-bold text-slate-900 leading-none">{data?.page ?? '—'} / {data?.totalPages ?? '—'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_2px_12px_rgba(15,23,42,0.06)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-1.5">Registros por Página</p>
            <p className="text-[32px] font-bold text-slate-900 leading-none">{pageSize}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Desde</span>
            <input
              type="date"
              value={fechaInicio}
              onChange={e => { setPagina(1); setFechaInicio(e.target.value) }}
              className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1565d8]/20"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Hasta</span>
            <input
              type="date"
              value={fechaFin}
              onChange={e => { setPagina(1); setFechaFin(e.target.value) }}
              className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1565d8]/20"
            />
          </div>
          <input
            type="number"
            placeholder="ID del paciente"
            value={pacienteSearch}
            onChange={e => { setPagina(1); setPacienteSearch(e.target.value) }}
            className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1565d8]/20 w-[160px]"
          />
          <button
            type="button"
            onClick={exportToExcel}
            disabled={exportando}
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-[13px] font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            {exportando ? 'Exportando...' : 'Exportar Excel'}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.06)] flex flex-col min-h-0 flex-1">
          <div className="flex-1 overflow-auto min-h-0">
            <table className="w-full">
              <thead className="bg-slate-50/80">
                <tr>
                  {['Fecha', 'Paciente', 'Síntomas', 'Riesgo', 'Médico', 'Estado'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-slate-400">Cargando historial...</td>
                  </tr>
                ) : !data?.data?.length ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-slate-400">No se encontraron consultas.</td>
                  </tr>
                ) : (
                  data.data.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => navigate({ to: '/doctor/consulta/$id', params: { id: String(c.id) } })}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3.5">
                        <p className="text-[12px] font-semibold text-slate-700">{new Date(c.createdAt).toLocaleDateString('es-ES')}</p>
                        <p className="text-[11px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1565d8]/10 text-[#1565d8] flex items-center justify-center text-[10px] font-bold shrink-0">
                            {c.paciente.nombre.charAt(0)}
                          </div>
                          <span className="text-[13px] font-semibold text-slate-700">{c.paciente.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100 truncate max-w-[200px] block">{c.input}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${RIESGO_COLORS[c.nivelRiesgo] ?? 'bg-slate-100 text-slate-500'}`}>
                          {c.nivelRiesgo}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] text-slate-600">{c.doctor.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${c.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                          {c.completed ? 'Completada' : 'Ongoing'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 shrink-0">
              <p className="text-[11px] text-slate-400">
                Mostrando {(data.page - 1) * pageSize + 1}–{Math.min(data.page * pageSize, data.total)} de {data.total} registros
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina <= 1}
                  className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 text-xs"
                >‹</button>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === data.totalPages || Math.abs(p - pagina) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-slate-300 px-1 text-xs">...</span>}
                      <button
                        type="button"
                        onClick={() => setPagina(p)}
                        className={`w-7 h-7 flex items-center justify-center rounded text-[12px] font-semibold transition-colors
                        ${p === pagina ? 'bg-[#1565d8] text-white' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                      >{p}</button>
                    </span>
                  ))}
                <button
                  type="button"
                  onClick={() => setPagina(p => Math.min(data.totalPages, p + 1))}
                  disabled={pagina >= data.totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 text-xs"
                >›</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainPanel>
  )
}
