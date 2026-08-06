import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import isAuthenticated from '../../../lib/is-authenticated'
import MainPanel from '../../../components/main-panel'
import { useQuery } from '@tanstack/react-query'
import fetchWithToken from '../../../lib/fetch-with-token'
// Removed unused import

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
  Alta: 'bg-red-100 text-red-700',
  Medio: 'bg-amber-100 text-amber-700',
  Media: 'bg-amber-100 text-amber-700',
  Moderado: 'bg-amber-100 text-amber-700',
  Moderada: 'bg-amber-100 text-amber-700',
  Bajo: 'bg-emerald-100 text-emerald-700',
  Baja: 'bg-emerald-100 text-emerald-700',
}

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
      if (!c.nivelRiesgo) continue
      const r = c.nivelRiesgo.toLowerCase().trim()
      let k: 'Alto' | 'Medio' | 'Bajo' | null = null
      
      if (r === 'alto' || r === 'alta') k = 'Alto'
      else if (r === 'medio' || r === 'media' || r === 'moderado' || r === 'moderada') k = 'Medio'
      else if (r === 'bajo' || r === 'baja' || r === 'leve') k = 'Bajo'
      
      if (k) counts[k]++
    }
    return counts
  }, [consultas])

  const ultimasConsultas = useMemo(
    () => consultas.slice(0, 5),
    [consultas]
  )

  const loading = loadingPacientes || loadingHistorial

  const headerContent = (
    <div className="flex flex-1 items-center justify-between w-full">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Panel de Control Médico</h1>
        <p className="text-xs text-slate-500 mt-0.5">Resumen de actividad diaria, distribución de riesgo y acceso rápido a consultas.</p>
      </div>
    </div>
  )

  return (
    <MainPanel headerContent={headerContent}>
      <section className="h-full p-8 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-[13px]">
            Cargando dashboard...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tarjetas métricas */}
            <div className="grid grid-cols-3 gap-5">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-1.5">Total Pacientes</p>
                    <p className="text-[32px] font-bold text-slate-900 leading-none">{totalPacientes}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#1565d8]/10 flex items-center justify-center text-[18px]"><i className="fa-solid fa-users text-[#1565d8]"></i></div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-1.5">Total Consultas</p>
                    <p className="text-[32px] font-bold text-slate-900 leading-none">{totalConsultas}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[18px]"><i className="fa-solid fa-stethoscope text-blue-600"></i></div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-1.5">Consultas Hoy</p>
                    <p className="text-[32px] font-bold text-slate-900 leading-none">{consultasHoy.length}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[18px]"><i className="fa-solid fa-clock-rotate-left text-emerald-600"></i></div>
                </div>
              </div>
            </div>

            {/* Distribución de Riesgos */}
            <div className="grid grid-cols-3 gap-5">
              {(['Alto', 'Medio', 'Bajo'] as const).map(riesgo => {
                const count = riesgos[riesgo]
                const total = totalConsultas || 1
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={riesgo} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between mb-3">
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
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">{pct}% del total histórico</p>
                  </div>
                )
              })}
            </div>

            {/* Tabla Pacientes de Hoy + Últimas Consultas */}
            <div className="grid grid-cols-2 gap-5">
              {/* Pacientes de Hoy */}
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)] flex flex-col overflow-hidden h-[400px]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                  <h2 className="text-[14px] font-bold text-slate-800">Consultas de Hoy</h2>
                </div>
                <div className="flex-1 overflow-auto">
                  {consultasHoy.length === 0 ? (
                    <div className="flex h-full items-center justify-center px-5 py-10 text-center text-[13px] text-slate-400">No hay consultas registradas hoy.</div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-50/80 sticky top-0">
                        <tr>
                          {['Paciente', 'Riesgo', 'Estado', 'Hora'].map(h => (
                            <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {consultasHoy.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50/60 transition-colors cursor-pointer">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#1565d8]/10 text-[#1565d8] flex items-center justify-center text-[11px] font-bold shrink-0">
                                  {iniciales(c.paciente?.nombre || 'Desconocido')}
                                </div>
                                <span className="text-[13px] font-semibold text-slate-700">{c.paciente?.nombre || 'Desconocido'}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-[13px] text-slate-500">
                              {c.nivelRiesgo || 'No evaluado'}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide ${c.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                {c.completed ? 'COMPLETADO' : 'EN PROGRESO'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-[12px] font-semibold text-slate-400">{formatearHora(c.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Últimas Consultas */}
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)] flex flex-col overflow-hidden h-[400px]">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                  <h2 className="text-[14px] font-bold text-slate-800">Últimas Consultas Históricas</h2>
                  <Link to="/doctor/historial" className="text-[12px] font-semibold text-[#1565d8] hover:text-[#0f56bd] transition-colors">Ver todas</Link>
                </div>
                <div className="flex-1 overflow-auto">
                  {ultimasConsultas.length === 0 ? (
                    <div className="flex h-full items-center justify-center px-5 py-10 text-center text-[13px] text-slate-400">No hay consultas registradas.</div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-50/80 sticky top-0">
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
                                <div className="w-7 h-7 rounded-full bg-[#1565d8]/10 text-[#1565d8] flex items-center justify-center text-[11px] font-bold shrink-0">{iniciales(c.paciente?.nombre || 'Desconocido')}</div>
                                <span className="text-[13px] font-semibold text-slate-700">{c.paciente?.nombre || 'Desconocido'}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide ${RIESGO_COLORS[c.nivelRiesgo] ?? 'bg-slate-100 text-slate-500'}`}>{c.nivelRiesgo}</span>
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
            </div>
          </div>
        )}
      </section>
    </MainPanel>
  )
}
