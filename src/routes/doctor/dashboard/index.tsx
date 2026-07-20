import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import isAuthenticated from '../../../lib/is-authenticated'
import MainPanel from '../../../components/main-panel'
import { useQuery } from '@tanstack/react-query'
import fetchWithToken from '../../../lib/fetch-with-token'
import type { Paciente } from '../../../types'

export const Route = createFileRoute('/doctor/dashboard/')({
  component: RouteComponent,
  beforeLoad: isAuthenticated
})

type ConsultaResumen = {
  id: number
  doctorId: number
  pacienteId: number
  input: string
  output: string
  nivelRiesgo: string
  modelo: string
  promptVersion: string
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
  Alto: 'bg-red-100 text-red-700',
  Medio: 'bg-amber-100 text-amber-700',
  Bajo: 'bg-emerald-100 text-emerald-700',
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  COMPLETED:   { label: 'COMPLETADO',   classes: 'bg-emerald-100 text-emerald-700' },
  IN_PROGRESS: { label: 'EN PROGRESO', classes: 'bg-blue-100 text-blue-700' },
  WAITING:     { label: 'EN ESPERA',    classes: 'bg-amber-100 text-amber-700' },
  SCHEDULED:   { label: 'PROGRAMADO',   classes: 'bg-slate-100 text-slate-500' },
}

const PACIENTES_HOY: Paciente[] = [
  { id: '1', hora: '09:00 AM', nombre: 'Arthur Wagner',  iniciales: 'AW', tipo: 'Seguimiento',       status: 'COMPLETED'   },
  { id: '2', hora: '10:30 AM', nombre: 'Maria Santos',   iniciales: 'MS', tipo: 'Consulta Inicial',  status: 'IN_PROGRESS' },
  { id: '3', hora: '11:15 AM', nombre: 'James Link',     iniciales: 'JL', tipo: 'Urgencia',          status: 'WAITING'     },
  { id: '4', hora: '01:45 PM', nombre: 'Emily Davis',    iniciales: 'ED', tipo: 'Revisión Radiológica', status: 'SCHEDULED'   },
]

function iniciales(nombre: string) {
  return nombre.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

function formatearFecha(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

function formatearHora(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function hoy() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function RouteComponent() {
  const { data: pacientesData, isLoading: loadingPacientes } = useQuery({
    queryKey: ['pacientes'],
    queryFn: async () => {
      const res = await fetchWithToken<{ pacientes: { id: number; nombre: string }[] }>(
        '/api/pacientes',
        { method: 'GET', headers: { 'content-type': 'application/json' } }
      )
      return res.data?.pacientes ?? []
    },
  })

  const { data: historialData, isLoading: loadingHistorial } = useQuery({
    queryKey: ['consulta-historial', 'all'],
    queryFn: async () => {
      const res = await fetchWithToken<PaginatedResponse<ConsultaResumen>>(
        `/api/consulta/historial?all=true&pageSize=100`,
        { method: 'GET', headers: { 'content-type': 'application/json' } }
      )
      return res.data
    },
  })

  const totalPacientes = pacientesData?.length ?? 0
  const consultas = historialData?.data ?? []
  const totalConsultas = historialData?.total ?? 0

  const consultasHoy = useMemo(
    () => consultas.filter(c => c.createdAt.startsWith(hoy())),
    [consultas]
  )

  const riesgos = useMemo(() => {
    const counts = { Alto: 0, Medio: 0, Bajo: 0 }
    for (const c of consultas) {
      const k = c.nivelRiesgo as keyof typeof counts
      if (k in counts) counts[k]++
    }
    return counts
  }, [consultas])

  const ultimasConsultas = useMemo(
    () => consultas.slice(0, 5),
    [consultas]
  )

  const loading = loadingPacientes || loadingHistorial

  return (
    <MainPanel>
      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-400 text-[13px]">
          Cargando dashboard...
        </div>
      ) : (
        <>
          {/* Tarjetas métricas */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-1.5">Total Pacientes</p>
                  <p className="text-[32px] font-bold text-slate-900 leading-none">{totalPacientes}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#1565d8]/10 flex items-center justify-center text-[18px]">👥</div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-1.5">Total Consultas</p>
                  <p className="text-[32px] font-bold text-slate-900 leading-none">{totalConsultas}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[18px]">📋</div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-1.5">Consultas Hoy</p>
                  <p className="text-[32px] font-bold text-slate-900 leading-none">{consultasHoy.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[18px]">📊</div>
              </div>
            </div>
          </div>

          {/* Distribución de Riesgos */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {(['Alto', 'Medio', 'Bajo'] as const).map(riesgo => {
              const count = riesgos[riesgo]
              const total = totalConsultas || 1
              const pct = Math.round((count / total) * 100)
              return (
                <div key={riesgo} className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${RIESGO_COLORS[riesgo]}`}>{riesgo}</span>
                    <span className="text-[22px] font-bold text-slate-900">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        riesgo === 'Alto' ? 'bg-red-400' : riesgo === 'Medio' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">{pct}% del total</p>
                </div>
              )
            })}
          </div>

          {/* Tabla Pacientes de Hoy + Últimas Consultas */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            {/* Pacientes de Hoy */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="text-[14px] font-bold text-slate-800">Pacientes de Hoy</h2>
              </div>
              <table className="w-full">
                <thead className="bg-slate-50/80">
                  <tr>
                    {['Hora', 'Nombre', 'Tipo', 'Estado'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PACIENTES_HOY.map(p => {
                    const s = STATUS_CONFIG[p.status]
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors cursor-pointer">
                        <td className="px-5 py-3.5 text-[12px] font-semibold text-slate-400">{p.hora}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#1565d8]/10 text-[#1565d8] flex items-center justify-center text-[11px] font-bold shrink-0">{p.iniciales}</div>
                            <span className="text-[13px] font-semibold text-slate-700">{p.nombre}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-slate-500">{p.tipo}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${s.classes}`}>{s.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Últimas Consultas */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="text-[14px] font-bold text-slate-800">Últimas Consultas</h2>
                <Link to="/doctor/consulta/historial" className="text-[12px] font-semibold text-[#1565d8] hover:text-[#0f56bd] transition-colors">Ver todas</Link>
              </div>
              {ultimasConsultas.length === 0 ? (
                <div className="px-5 py-10 text-center text-[13px] text-slate-400">No hay consultas registradas.</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-slate-50/80">
                    <tr>
                      {['Paciente', 'Riesgo', 'Fecha', 'Hora'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ultimasConsultas.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors cursor-pointer">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#1565d8]/10 text-[#1565d8] flex items-center justify-center text-[11px] font-bold shrink-0">{iniciales(c.paciente.nombre)}</div>
                            <span className="text-[13px] font-semibold text-slate-700">{c.paciente.nombre}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${RIESGO_COLORS[c.nivelRiesgo] ?? 'bg-slate-100 text-slate-500'}`}>{c.nivelRiesgo}</span>
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-slate-500">{formatearFecha(c.createdAt)}</td>
                        <td className="px-5 py-3.5 text-[13px] text-slate-500">{formatearHora(c.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </MainPanel>
  )
}
