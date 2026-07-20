import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import MainPanel from '../../../components/main-panel'
import isAuthenticated from '../../../lib/is-authenticated'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import fetchWithToken from '../../../lib/fetch-with-token'

export const Route = createFileRoute('/doctor/consulta/')({
  component: RouteComponent,
  beforeLoad: isAuthenticated
})

type ConsultaEntry = {
  id: number
  pacienteId: number
  input: string
  output: string
  nivelRiesgo: string
  modelo: string
  tokens: number
  createdAt: string
  completed: string | null
  paciente: { id: number; nombre: string; documento: string }
}

type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

type Paciente = {
  id: number
  nombre: string
  documento: string
}

const RIESGO_COLORS: Record<string, string> = {
  Alto: 'bg-rose-100 text-rose-700',
  Medio: 'bg-amber-100 text-amber-700',
  Bajo: 'bg-emerald-100 text-emerald-700',
}

function RouteComponent() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [pagina, setPagina] = useState(1)
  const [pacienteInput, setPacienteInput] = useState('')
  const [pacienteId, setPacienteId] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setPacienteId(pacienteInput)
      setPagina(1)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [pacienteInput])

  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [sintomas, setSintomas] = useState('')
  const [creando, setCreando] = useState(false)
  const [busquedaPacientes, setBusquedaPacientes] = useState('')
  const busquedaDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [busquedaQuery, setBusquedaQuery] = useState('')
  useEffect(() => {
    busquedaDebounce.current = setTimeout(() => {
      setBusquedaQuery(busquedaPacientes)
    }, 300)
    return () => clearTimeout(busquedaDebounce.current)
  }, [busquedaPacientes])

  const [resultadoConsulta, setResultadoConsulta] = useState<ConsultaEntry | null>(null)

  const { data: pacientesLista } = useQuery({
    queryKey: ['pacientes-busqueda', busquedaQuery],
    queryFn: async () => {
      const params = busquedaQuery ? `?search=${encodeURIComponent(busquedaQuery)}` : ''
      const res = await fetchWithToken<{ pacientes: Paciente[] }>(`/api/pacientes${params}`)
      if (!res.success) throw new Error(res.error || 'Error al buscar pacientes')
      return res.data?.pacientes ?? []
    },
    enabled: modalOpen,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['consulta-historial', pagina, pacienteId, fechaInicio, fechaFin],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(pagina), pageSize: '10' })
      if (pacienteId) params.set('pacienteId', pacienteId)
      if (fechaInicio) params.set('fechaInicio', fechaInicio)
      if (fechaFin) params.set('fechaFin', fechaFin)

      const res = await fetchWithToken<PaginatedResponse<ConsultaEntry>>(
        `/api/consulta/historial?${params}`
      )
      if (!res.success) throw new Error(res.error || 'Error al obtener historial')
      return res.data
    },
  })

  const totalPaginas = data?.totalPages ?? 1

  const handleFechaFinChange = (value: string) => {
    setFechaFin(value)
    setPagina(1)
  }

  const abrirModal = () => {
    setSelectedPaciente(null)
    setSintomas('')
    setResultadoConsulta(null)
    setBusquedaPacientes('')
    setBusquedaQuery('')
    setModalOpen(true)
  }

  const crearConsulta = async () => {
    if (!selectedPaciente || !sintomas.trim()) return
    setCreando(true)
    try {
      const res = await fetchWithToken<ConsultaEntry>('/api/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pacienteId: selectedPaciente.id, input: sintomas.trim() }),
      })
      if (!res.success || !res.data) throw new Error(res.error || 'Error al crear consulta')
      setResultadoConsulta(res.data)
      queryClient.invalidateQueries({ queryKey: ['consulta-historial'] })
    } catch (e) {
      console.error(e)
    } finally {
      setCreando(false)
    }
  }

  return (
    <MainPanel>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-bold text-slate-900">Historial de Consultas</h1>
            <p className="text-[13px] text-slate-400 mt-0.5">
              Consultas diagnósticas realizadas con IA.
            </p>
          </div>
          <button
            type="button"
            onClick={abrirModal}
            className="px-4 py-2 bg-[#1565d8] text-white rounded-lg text-[13px] font-semibold hover:bg-[#124fa8] transition-colors"
          >
            + Nueva Consulta
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            aria-label="Filtrar por ID de paciente"
            type="text"
            placeholder="ID del paciente..."
            value={pacienteInput}
            onChange={e => setPacienteInput(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1565d8] w-40"
          />
          <input
            aria-label="Fecha inicio"
            type="date"
            value={fechaInicio}
            onChange={e => { setFechaInicio(e.target.value); setPagina(1) }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1565d8]"
          />
          <input
            aria-label="Fecha fin"
            type="date"
            value={fechaFin}
            onChange={e => handleFechaFinChange(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1565d8]"
          />
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] overflow-hidden">
          <div className="overflow-auto h-[500px]">
            <table className="w-full">
              <thead className="bg-slate-50/80">
                <tr>
                  {[
                    { label: 'Paciente', w: 'w-[180px]' },
                    { label: 'Síntomas', w: 'w-auto' },
                    { label: 'Riesgo', w: 'w-[100px]' },
                    { label: 'Estado', w: 'w-[110px]' },
                    { label: 'Modelo', w: 'w-[140px]' },
                    { label: 'Tokens', w: 'w-[80px]' },
                    { label: 'Fecha', w: 'w-[170px]' },
                  ].map(c => (
                    <th key={c.label} className={`text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 ${c.w}`}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-[13px] text-slate-400">
                      Cargando historial...
                    </td>
                  </tr>
                ) : !data || data.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-[13px] text-slate-400">
                      No se encontraron consultas.
                    </td>
                  </tr>
                ) : data.data.map(c => (
                  <tr key={c.id} onClick={() => navigate({ to: '/doctor/consulta/$id', params: { id: String(c.id) } })} className="hover:bg-slate-50/60 transition-colors cursor-pointer">
                    <td className="px-5 py-2.5 w-[180px] truncate">
                      <span className="text-[13px] font-semibold text-slate-700">{c.paciente.nombre}</span>
                      <span className="text-[11px] text-slate-400 ml-2">#{c.paciente.documento}</span>
                    </td>
                    <td className="px-5 py-2.5 text-[13px] text-slate-500 truncate whitespace-nowrap overflow-hidden max-w-0">
                      {c.input}
                    </td>
                    <td className="px-5 py-2.5 w-[100px]">
                      <span className={`w-full flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${RIESGO_COLORS[c.nivelRiesgo] ?? 'bg-slate-100 text-slate-500'}`}>
                        {c.nivelRiesgo}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 w-[110px]">
                      <span className={`w-full flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${
                        c.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {c.completed ? 'Completada' : 'Ongoing'}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-[12px] text-slate-400 w-[140px] truncate">
                      {c.modelo}
                    </td>
                    <td className="px-5 py-2.5 text-[13px] text-slate-500 w-[80px]">
                      {c.tokens.toLocaleString()}
                    </td>
                    <td className="px-5 py-2.5 text-[12px] text-slate-400 whitespace-nowrap w-[170px]">
                      {new Date(c.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 shrink-0">
            <p className="text-[11px] text-slate-400">
              Mostrando {data ? data.data.length : 0} de {data?.total ?? 0} consultas
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >‹</button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setPagina(n)}
                  className={`w-7 h-7 flex items-center justify-center rounded text-[12px] font-semibold transition-colors ${
                    n === pagina
                      ? 'bg-[#1565d8] text-white'
                      : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >{n}</button>
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-[18px] font-bold text-slate-900">Nueva Consulta</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 text-lg transition-colors"
              >✕</button>
            </div>

            <div className="p-6 space-y-5">
              {resultadoConsulta ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="text-emerald-600 text-[13px] font-semibold">✓ Consulta creada exitosamente</span>
                    <span className={`ml-auto px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${RIESGO_COLORS[resultadoConsulta.nivelRiesgo]}`}>
                      {resultadoConsulta.nivelRiesgo}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Diagnóstico Generado</p>
                    <p className="text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed">{resultadoConsulta.output}</p>
                  </div>
                  <div className="flex gap-4 text-[12px] text-slate-400">
                    <span>Modelo: {resultadoConsulta.modelo}</span>
                    <span>Tokens: {resultadoConsulta.tokens.toLocaleString()}</span>
                    <span>Paciente: {resultadoConsulta.paciente.nombre}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setModalOpen(false); setResultadoConsulta(null) }}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                    >Cerrar</button>
                    <button
                      type="button"
                      onClick={() => { setResultadoConsulta(null); setSelectedPaciente(null); setSintomas(''); setBusquedaPacientes(''); setBusquedaQuery('') }}
                      className="px-4 py-2 bg-[#1565d8] text-white rounded-lg text-[13px] font-semibold hover:bg-[#124fa8] transition-colors"
                    >Nueva Consulta</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Paciente</label>
                    <input
                      type="text"
                      placeholder="Buscar paciente por nombre o documento..."
                      value={busquedaPacientes}
                      onChange={e => setBusquedaPacientes(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1565d8]"
                    />
                    {pacientesLista && pacientesLista.length > 0 && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                        {pacientesLista.map(p => (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => setSelectedPaciente(p)}
                            className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors hover:bg-slate-50 ${
                              selectedPaciente?.id === p.id ? 'bg-[#1565d8]/10 text-[#1565d8] font-semibold' : 'text-slate-700'
                            }`}
                          >
                            {p.nombre} <span className="text-slate-400 ml-1">#{p.documento}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {selectedPaciente && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#1565d8]/5 border border-[#1565d8]/20 rounded-lg text-[13px] text-[#1565d8]">
                        <span>✓ {selectedPaciente.nombre} — #{selectedPaciente.documento}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedPaciente(null)}
                          className="ml-auto text-slate-400 hover:text-slate-600"
                        >✕</button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Síntomas y datos clínicos</label>
                    <textarea
                      placeholder="Describa los síntomas, antecedentes y hallazgos clínicos del paciente..."
                      value={sintomas}
                      onChange={e => setSintomas(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1565d8] resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={crearConsulta}
                    disabled={!selectedPaciente || !sintomas.trim() || creando}
                    className="w-full py-2.5 bg-[#1565d8] text-white rounded-lg text-[13px] font-semibold hover:bg-[#124fa8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {creando ? 'Procesando con IA...' : 'Realizar Consulta'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </MainPanel>
  )
}