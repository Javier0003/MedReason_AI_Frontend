import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import isAuthenticated from '../../../lib/is-authenticated'
import MainPanel from '../../../components/main-panel'
import { useQuery } from '@tanstack/react-query'
import fetchWithToken from '../../../lib/fetch-with-token'

export const Route = createFileRoute('/doctor/dashboard/')({
  component: RouteComponent,
  beforeLoad: isAuthenticated
})

type PacienteResumen = {
  id: number
  nombre: string
  edad: number
  sexo: string
  documento: string
}

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
  Alto: 'bg-red-50 text-red-600',
  Medio: 'bg-amber-50 text-amber-600',
  Bajo: 'bg-emerald-50 text-emerald-600',
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
  const [search, setSearch] = useState('')

  const { data: pacientesData, isLoading: loadingPacientes } = useQuery({
    queryKey: ['pacientes'],
    queryFn: async () => {
      const res = await fetchWithToken<{ pacientes: PacienteResumen[] }>(
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

  const pacientes = pacientesData ?? []
  const totalPacientes = pacientes.length
  const consultas = historialData?.data ?? []
  const totalConsultas = historialData?.total ?? 0

  const pacientesFiltrados = useMemo(
    () => pacientes.filter(p =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.documento.toLowerCase().includes(search.toLowerCase())
    ),
    [search, pacientes]
  )

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

          {/* Tabla Pacientes + Últimas Consultas */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            {/* Pacientes */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="text-[14px] font-bold text-slate-800">Pacientes</h2>
                <Link to="/doctor/pacientes" className="text-[12px] font-semibold text-[#1565d8] hover:text-[#0f56bd] transition-colors">Ver todos</Link>
              </div>

              <div className="px-5 py-3 border-b border-slate-100">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar pacientes por nombre o documento..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1565d8] focus:ring-2 focus:ring-[#1565d8]/10 transition-colors"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[11px]">✕</button>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto max-h-[360px]">
                <table className="w-full">
                  <thead className="bg-slate-50/80 sticky top-0">
                    <tr>
                      {['Edad', 'Nombre', 'Documento', 'Sexo'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pacientesFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-10 text-center text-[13px] text-slate-400">
                          No se encontraron pacientes{search && ` para "${search}"`}
                        </td>
                      </tr>
                    ) : pacientesFiltrados.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors cursor-pointer">
                        <td className="px-5 py-3.5 text-[12px] font-semibold text-slate-400">{p.edad}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#1565d8]/10 text-[#1565d8] flex items-center justify-center text-[11px] font-bold shrink-0">{iniciales(p.nombre)}</div>
                            <span className="text-[13px] font-semibold text-slate-700">{p.nombre}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-slate-500">{p.documento}</td>
                        <td className="px-5 py-3.5 text-[13px] text-slate-500">{p.sexo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Últimas Consultas */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="text-[14px] font-bold text-slate-800">Últimas Consultas</h2>
                <Link to="/doctor/historial" className="text-[12px] font-semibold text-[#1565d8] hover:text-[#0f56bd] transition-colors">Ver todas</Link>
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