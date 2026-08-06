import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import MainPanel from '../../../components/main-panel'
import isAuthenticated from '../../../lib/is-authenticated'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import fetchWithToken from '../../../lib/fetch-with-token'
import { showToast } from '../../../lib/toast'

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
  Alta: 'bg-rose-100 text-rose-700',
  Medio: 'bg-amber-100 text-amber-700',
  Media: 'bg-amber-100 text-amber-700',
  Moderado: 'bg-amber-100 text-amber-700',
  Moderada: 'bg-amber-100 text-amber-700',
  Bajo: 'bg-emerald-100 text-emerald-700',
  Baja: 'bg-emerald-100 text-emerald-700',
  Leve: 'bg-emerald-100 text-emerald-700',
}

const getVisiblePages = (current: number, total: number) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
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
      if (res.status === 429) {
        showToast('Límite de Consultas', 'Has alcanzado el límite de 100 consultas por hora. Intenta nuevamente más tarde.', 'warning')
        return
      }
      if (!res.success || !res.data) throw new Error(res.error || 'Error al crear consulta')
      setResultadoConsulta(res.data)
      queryClient.invalidateQueries({ queryKey: ['consulta-historial'] })
    } catch (e) {
      console.error(e)
    } finally {
      setCreando(false)
    }
  }

  const headerContent = (
    <div className="flex flex-1 items-center justify-between w-full">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Consultas IA</h1>
        <p className="text-xs text-slate-500 mt-0.5">Inicia un diagnóstico asistido por IA o revisa consultas recientes.</p>
      </div>
    </div>
  )

  return (
    <MainPanel headerContent={headerContent}>
      <section className="h-full p-8 overflow-y-auto">
        
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)] flex flex-col h-full min-h-[600px] overflow-hidden">
          {/* Header de la tarjeta con filtros y acción */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3 flex-wrap flex-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg className="w-[15px] h-[15px]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/></svg>
                </span>
                <input
                  aria-label="Filtrar por ID de paciente"
                  type="text"
                  placeholder="ID del paciente..."
                  value={pacienteInput}
                  onChange={e => setPacienteInput(e.target.value)}
                  className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1565d8]/20 w-48"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Desde</span>
                <input
                  aria-label="Fecha inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={e => { setFechaInicio(e.target.value); setPagina(1) }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1565d8]/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Hasta</span>
                <input
                  aria-label="Fecha fin"
                  type="date"
                  value={fechaFin}
                  onChange={e => handleFechaFinChange(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1565d8]/20"
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={abrirModal}
              className="px-5 py-2 flex items-center justify-center text-[13px] font-semibold text-white bg-[#1565d8] rounded-lg hover:bg-[#0f56bd] transition-colors shadow-sm shrink-0 gap-2"
            >
              <i className="fa-solid fa-plus"></i> Nueva Consulta
            </button>
          </div>

          <div className="overflow-auto flex-1 min-h-0">
            <table className="w-full">
              <thead className="bg-slate-50/80 sticky top-0">
                <tr>
                  {[
                    { label: 'ID', w: 'w-[60px]' },
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
                    <td colSpan={8} className="px-5 py-10 text-center text-[13px] text-slate-400">
                      Cargando historial...
                    </td>
                  </tr>
                ) : !data || data.data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-[13px] text-slate-400">
                      No se encontraron consultas.
                    </td>
                  </tr>
                ) : data.data.map(c => (
                  <tr key={c.id} onClick={() => navigate({ to: '/doctor/consulta/$id', params: { id: String(c.id) } })} className="hover:bg-slate-50/60 transition-colors cursor-pointer">
                    <td className="px-5 py-2.5 w-[60px] truncate text-[12px] font-bold text-slate-400">
                      #{c.paciente.id}
                    </td>
                    <td className="px-5 py-2.5 w-[180px] truncate">
                      <span className="text-[13px] font-semibold text-slate-700">{c.paciente.nombre}</span>
                      <span className="text-[11px] text-slate-400 ml-2">#{c.paciente.documento}</span>
                    </td>
                    <td className="px-5 py-2.5 w-[200px]">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100 truncate max-w-[200px] block">
                        {c.input}
                      </span>
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
                        {c.completed ? 'Completada' : 'En Progreso'}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-[12px] text-slate-400 w-[140px] truncate">
                      {c.modelo}
                    </td>
                    <td className="px-5 py-2.5 text-[13px] text-slate-500 w-[80px]">
                      {c.tokens.toLocaleString()}
                    </td>
                    <td className="px-5 py-2.5 whitespace-nowrap w-[170px]">
                      <p className="text-[12px] font-semibold text-slate-700">{new Date(c.createdAt).toLocaleDateString('es-ES')}</p>
                      <p className="text-[11px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
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
                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 text-[10px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              ><i className="fa-solid fa-chevron-left"></i></button>
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
                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 text-[10px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              ><i className="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
        </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-[18px] font-bold text-slate-900"><i className="fa-solid fa-stethoscope text-[#1565d8] mr-2"></i> Nueva Consulta</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 text-lg transition-colors"
              ><i className="fa-solid fa-xmark"></i></button>
            </div>

            <div className="p-6 space-y-5">
              {resultadoConsulta ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="text-emerald-700 text-[13px] font-semibold"><i className="fa-solid fa-circle-check mr-1.5"></i> Consulta creada exitosamente</span>
                    <span className={`ml-auto px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${RIESGO_COLORS[resultadoConsulta.nivelRiesgo]}`}>
                      {resultadoConsulta.nivelRiesgo}
                    </span>
                  </div>
                    <div className="text-center p-6 bg-white border border-slate-200 rounded-lg">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
                        <i className="fa-solid fa-check"></i>
                      </div>
                      <p className="text-[16px] font-bold text-slate-800">¡Diagnóstico de IA Completo!</p>
                      <p className="text-[13px] text-slate-500 mt-2">
                        El expediente se ha procesado exitosamente. Haz clic en el botón de abajo para ver el análisis detallado, los riesgos y las tarjetas de diagnóstico en pantalla completa.
                      </p>
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
                      onClick={() => navigate({ to: '/doctor/consulta/$id', params: { id: String(resultadoConsulta.id) } })}
                      className="px-6 py-2.5 bg-[#1565d8] text-white rounded-lg text-[13px] font-bold hover:bg-[#124fa8] transition-colors shadow-sm w-full flex items-center justify-center gap-2"
                    >Abrir Expediente Completo <i className="fa-solid fa-arrow-right"></i></button>
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
                        <span className="font-medium"><i className="fa-solid fa-check mr-1.5"></i> {selectedPaciente.nombre} — #{selectedPaciente.documento}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedPaciente(null)}
                          className="ml-auto text-[#1565d8]/60 hover:text-[#1565d8]"
                        ><i className="fa-solid fa-xmark"></i></button>
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
                    className="flex items-center justify-center w-full py-2.5 bg-[#1565d8] text-white rounded-lg text-[13px] font-semibold hover:bg-[#124fa8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                  >
                    {creando ? (
                      <>
                        <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                        Procesando con IA...
                      </>
                    ) : 'Realizar Consulta'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      </section>
    </MainPanel>
  )
}