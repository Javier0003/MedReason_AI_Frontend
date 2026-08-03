import { createFileRoute, Link } from '@tanstack/react-router'
import MainPanel from '../../../components/main-panel'
import ReactMarkdown from 'react-markdown'
import isAuthenticated from '../../../lib/is-authenticated'
import { useQuery } from '@tanstack/react-query'
import fetchWithToken from '../../../lib/fetch-with-token'
import { useRef, useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import IconArrowRight from '../../../assets/svg/IconArrowRight'

type Diagnostico = {
  enfermedad: string;
  probabilidad: number;
  nivelRiesgo: string;
  explicacion: string;
}

type ConsultaOutputObj = {
  diagnosticos?: Diagnostico[];
  recomendaciones?: string;
  signosAlarma?: string[];
  nivelUrgencia?: string;
}

type ConsultaData = {
  id: number
  doctorId: number
  pacienteId: number
  input: string
  output: ConsultaOutputObj
  nivelRiesgo: string
  modelo: string
  promptVersion: string
  tokens: number
  createdAt: string
  completed: string | null
  paciente: { id: number; nombre: string; documento: string }
  doctor: { id: number; nombre: string; email: string }
  chatbotAnswers: { id: number; question: string; answer: string; tokens: number; createdAt: string }[]
}

export const Route = createFileRoute('/doctor/consulta/$id')({
  component: RouteComponent,
  beforeLoad: isAuthenticated,
})

const RIESGO_COLORS: Record<string, { bg: string, text: string, border: string, bar: string }> = {
  Alto: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', bar: 'bg-rose-500' },
  Medio: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500' },
  Bajo: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500' },
}

function RouteComponent() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()

  const { data: consulta, isLoading, error } = useQuery({
    queryKey: ['consulta', id],
    queryFn: async () => {
      const res = await fetchWithToken<ConsultaData>(`/api/consulta/${id}`)
      if (!res.success || !res.data) {
        const err = new Error(res.error || 'Error al obtener consulta') as Error & { status?: number | null }
        err.status = res.status
        throw err
      }
      return res.data
    },
    retry: false,
  })

  const messageForAi = useRef<HTMLInputElement>(null)

  const [messages, setMessages] = useState<{ sender: string; text: string; tokens?: number }[]>([])
  const [editandoSintomas, setEditandoSintomas] = useState(false)
  const [editandoObservaciones, setEditandoObservaciones] = useState(false)
  const [sintomasEdit, setSintomasEdit] = useState('')
  const [observacionesEdit, setObservacionesEdit] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [askingAI, setAskingAI] = useState(false)

  useEffect(() => {
    if (consulta?.chatbotAnswers) {
      const msgs: { sender: string; text: string; tokens?: number }[] = []
      for (const a of consulta.chatbotAnswers) {
        msgs.push({ sender: 'doctor', text: a.question })
        msgs.push({ sender: 'ai', text: a.answer, tokens: a.tokens })
      }
      setMessages(msgs)
    }
  }, [consulta?.chatbotAnswers])

  const guardarCambios = async (data: { input?: string; output?: string; completed?: string }) => {
    setGuardando(true)
    try {
      const res = await fetchWithToken<ConsultaData>(`/api/consulta/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.success) throw new Error(res.error || 'Error al guardar')
      queryClient.invalidateQueries({ queryKey: ['consulta', id] })
      setEditandoSintomas(false)
      setEditandoObservaciones(false)
    } catch (e) {
      console.log((e as Error).message)
    } finally {
      setGuardando(false)
    }
  }

  const handleAskAI = async () => {
    const text = messageForAi.current?.value?.trim()
    if (!text || askingAI) return
    setAskingAI(true)
    setMessages(prev => [...prev, { sender: 'doctor', text }])
    messageForAi.current!.value = ''
    const res = await fetchWithToken<{ answer: string, tokens: number }>('/api/chatbot/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultaId: Number(id), question: text }),
    })
    if (res.success && res.data) {
      setMessages(prev => [...prev, { sender: 'ai', text: res.data!.answer, tokens: res.data!.tokens }])
    } else {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Error al obtener respuesta.' }])
    }
    setAskingAI(false)
  }

  const handleSaveDraft = () => {
    if (!editandoSintomas && !editandoObservaciones) return
    guardarCambios({
      ...(editandoSintomas ? { input: sintomasEdit } : {}),
      ...(editandoObservaciones ? { output: observacionesEdit } : {}),
    })
  }

  const handleCompleteConsultation = () => {
    guardarCambios({ completed: new Date().toISOString() })
  }

  if (isLoading) {
    return (
      <MainPanel>
        <div className="flex items-center justify-center h-full p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-[#1565d8] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">Cargando expediente...</p>
          </div>
        </div>
      </MainPanel>
    )
  }

  if (error) {
    const notFound = (error as Error & { status?: number | null }).status === 404
    return (
      <MainPanel>
        <div className="flex items-center justify-center h-full p-6">
          <div className="text-center space-y-3 max-w-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📁</span>
            </div>
            <p className="text-[18px] font-bold text-slate-800">
              {notFound ? 'Expediente Confidencial' : 'Error al cargar la consulta'}
            </p>
            <p className="text-[14px] text-slate-500 leading-relaxed">
              {notFound
                ? 'El expediente solicitado no existe o pertenece a otro profesional médico. El acceso a estos registros está restringido por políticas de privacidad.'
                : (error as Error).message}
            </p>
            <Link
              to="/doctor/consulta"
              className="inline-block mt-4 px-6 py-2.5 bg-slate-800 text-white rounded-lg text-[13px] font-semibold hover:bg-slate-700 transition-colors shadow-sm"
            >
              Volver al Historial
            </Link>
          </div>
        </div>
      </MainPanel>
    )
  }

  if (!consulta) {
    return (
      <MainPanel>
        <div className="flex items-center justify-center h-full p-6">
          <p className="text-[13px] text-slate-400">Consulta no encontrada.</p>
        </div>
      </MainPanel>
    )
  }

  const iniciarEdicionSintomas = () => {
    setSintomasEdit(consulta.input)
    setEditandoSintomas(true)
  }

  const iniciarEdicionObservaciones = () => {
    // Si el output es un objeto, lo stringificamos para que el doctor pueda editar el JSON o texto
    const val = typeof consulta.output === 'object' ? JSON.stringify(consulta.output, null, 2) : consulta.output
    setObservacionesEdit(val)
    setEditandoObservaciones(true)
  }

  const renderOutputObj = (outputObj: ConsultaOutputObj) => {
    return (
      <div className="space-y-8">

        {/* Signos de Alarma */}
        {outputObj.signosAlarma && outputObj.signosAlarma.length > 0 && (
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-rose-500 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              Signos Clínicos de Alarma
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {outputObj.signosAlarma.map((signo, i) => (
                <div key={i} className="flex items-start gap-3 bg-white border-l-4 border-l-rose-500 border-y border-r border-slate-100 p-3.5 rounded-r-xl shadow-sm">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-[13px] font-medium text-slate-700 leading-snug">{signo}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Diagnósticos Diferenciales */}
        {outputObj.diagnosticos && outputObj.diagnosticos.length > 0 && (
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-3">
              Diagnósticos Diferenciales Sugeridos
            </h3>
            <div className="space-y-3">
              {outputObj.diagnosticos.map((diag, i) => {
                const colorTheme = RIESGO_COLORS[diag.nivelRiesgo] || RIESGO_COLORS['Bajo'];
                return (
                  <div key={i} className={`p-4 rounded-xl border ${colorTheme.border} ${colorTheme.bg} transition-all hover:shadow-sm`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-[16px] font-bold text-slate-900">{diag.enfermedad}</h4>
                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${colorTheme.border} ${colorTheme.text}`}>
                          Riesgo {diag.nivelRiesgo}
                        </span>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[20px] font-bold text-slate-800 tracking-tight">{diag.probabilidad}%</span>
                        <span className="text-[10px] font-medium text-slate-500 uppercase">Probabilidad</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden mb-3 border border-slate-200/50">
                      <div className={`h-full ${colorTheme.bar}`} style={{ width: `${diag.probabilidad}%` }}></div>
                    </div>

                    <p className="text-[13px] text-slate-700 leading-relaxed bg-white/50 p-3 rounded-lg border border-slate-100/50">
                      <span className="font-semibold text-slate-800">Justificación Clínica:</span> {diag.explicacion}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Recomendaciones */}
        {outputObj.recomendaciones && (
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#1565d8] mb-3">
              Plan y Recomendaciones
            </h3>
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
              <p className="text-[14px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                {outputObj.recomendaciones}
              </p>
            </div>
          </section>
        )}

      </div>
    )
  }

  const uiNivelRiesgo = typeof consulta.output === 'object' ? (consulta.output.nivelUrgencia || consulta.nivelRiesgo) : consulta.nivelRiesgo;

  return (
    <MainPanel>
      <div className="flex flex-row gap-5 h-full min-h-0 bg-[#f8fafc] p-4">
        <section className="flex-1 overflow-y-auto pr-2 min-h-0">

          {/* Header del Expediente */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-row gap-5 mb-5 items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1565d8]/10 to-[#124fa8]/10 border border-[#1565d8]/20 flex items-center justify-center text-[#1565d8] font-bold text-2xl shrink-0">
              {consulta.paciente.nombre.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-[20px] font-extrabold text-slate-900 tracking-tight">{consulta.paciente.nombre}</h2>
              <section className="flex gap-3 mt-1 text-[13px] font-medium text-slate-500">
                <p>NSS: <span className="text-slate-700">#{consulta.paciente.documento}</span></p>
                <span className="text-slate-300">|</span>
                <p>Médico Tratante: <span className="text-slate-700">Dr. {consulta.doctor.nombre}</span></p>
                <span className="text-slate-300">|</span>
                <p>Fecha: <span className="text-slate-700">{new Date(consulta.createdAt).toLocaleDateString()}</span></p>
              </section>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                {consulta.completed && (
                  <span className="px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Cerrada
                  </span>
                )}
                <span className={`px-3 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border ${RIESGO_COLORS[uiNivelRiesgo]?.bg || 'bg-slate-100'} ${RIESGO_COLORS[uiNivelRiesgo]?.text || 'text-slate-500'} ${RIESGO_COLORS[uiNivelRiesgo]?.border || 'border-slate-200'}`}>
                  Riesgo {uiNivelRiesgo}
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                Modelo: {consulta.modelo} ({consulta.tokens.toLocaleString()} tokens)
              </span>
            </div>
          </div>

          {/* Anamnesis y Síntomas */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col gap-4 mb-5 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-6 bg-slate-300 rounded-full"></span>
                <h3 className="text-[15px] font-bold text-slate-800 tracking-tight">Anamnesis y Motivo de Consulta</h3>
              </div>
              <div className="flex gap-2">
                {editandoSintomas ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditandoSintomas(false)}
                      className="text-[12px] text-slate-500 hover:text-slate-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                    >Cancelar</button>
                    <button
                      type="button"
                      onClick={() => guardarCambios({ input: sintomasEdit })}
                      disabled={guardando}
                      className="text-[12px] bg-slate-800 text-white hover:bg-slate-700 font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >{guardando ? 'Guardando...' : 'Guardar'}</button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={iniciarEdicionSintomas}
                    className="text-[12px] text-[#1565d8] hover:bg-[#1565d8]/10 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >Editar Registro</button>
                )}
              </div>
            </div>

            {editandoSintomas ? (
              <textarea
                value={sintomasEdit}
                onChange={e => setSintomasEdit(e.target.value)}
                rows={5}
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-[14px] text-slate-700 focus:outline-none focus:border-[#1565d8] resize-none transition-colors"
              />
            ) : (
              <p className="text-[14px] text-slate-700 whitespace-pre-wrap leading-relaxed px-1">
                {consulta.input}
              </p>
            )}
          </div>

          {/* Análisis de IA */}
          <div className="bg-white rounded-2xl border border-[#1565d8]/20 shadow-[0_4px_20px_rgba(21,101,216,0.05)] flex flex-col gap-4 mb-5 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1565d8] to-purple-500"></div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[18px]">🧠</span>
                <h3 className="text-[15px] font-bold text-slate-800 tracking-tight">Análisis Clínico de IA</h3>
              </div>
              <div className="flex gap-2">
                {editandoObservaciones ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditandoObservaciones(false)}
                      className="text-[12px] text-slate-500 hover:text-slate-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                    >Cancelar</button>
                    <button
                      type="button"
                      onClick={() => guardarCambios({ output: observacionesEdit })}
                      disabled={guardando}
                      className="text-[12px] bg-[#1565d8] text-white hover:bg-[#124fa8] font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >{guardando ? 'Guardando...' : 'Guardar'}</button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={iniciarEdicionObservaciones}
                    className="text-[12px] text-[#1565d8] hover:bg-[#1565d8]/10 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >Ajustar Diagnóstico</button>
                )}
              </div>
            </div>

            {editandoObservaciones ? (
              <textarea
                value={observacionesEdit}
                onChange={e => setObservacionesEdit(e.target.value)}
                rows={12}
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-[13px] font-mono text-slate-700 focus:outline-none focus:border-[#1565d8] resize-none transition-colors"
                placeholder="El JSON o texto de la IA se mostrará aquí..."
              />
            ) : (
              typeof consulta.output === 'object'
                ? renderOutputObj(consulta.output)
                : <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[14px] text-slate-700 whitespace-pre-wrap leading-relaxed font-mono text-sm">{consulta.output}</p>
                  </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-row gap-3 justify-end mt-8 mb-4">
            {(editandoSintomas || editandoObservaciones) && (
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={guardando}
                className="px-6 py-2.5 border border-slate-300 bg-white rounded-xl text-[14px] text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
              >
                {guardando ? 'Guardando cambios...' : 'Guardar Borrador'}
              </button>
            )}
            <button
              type="button"
              onClick={handleCompleteConsultation}
              disabled={!!consulta.completed || guardando}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[14px] font-bold hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {consulta.completed ? (
                <><span>✓</span> Expediente Cerrado</>
              ) : guardando ? (
                'Procesando...'
              ) : (
                'Cerrar Expediente Médico'
              )}
            </button>
          </div>
        </section>

        {/* Panel del Chatbot AI lateral */}
        <section className="w-80 bg-white rounded-2xl border border-slate-200/60 shadow-sm flex flex-col shrink-0 h-full min-h-0">
          <div className="p-4 border-b border-slate-100 shrink-0 bg-slate-50/50 rounded-t-2xl">
            <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
              <span className="text-[#1565d8]">✦</span> Asistente Clínico AI
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Haga preguntas específicas sobre este caso</p>
          </div>

          <section className="flex flex-col gap-4 flex-1 overflow-y-auto p-4 min-h-0 bg-slate-50/30">
            {messages.length === 0 && (
              <div className="text-center mt-10">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                  💬
                </div>
                <p className="text-[13px] text-slate-500 font-medium">¿Dudas sobre el diagnóstico?</p>
                <p className="text-[11px] text-slate-400 mt-1">Pregunta interacciones medicamentosas o estudios complementarios.</p>
              </div>
            )}
            {messages.map((message, index) => (
              <Message key={index} sender={message.sender} text={message.text} tokens={message.tokens} />
            ))}
            {askingAI && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-500 max-w-[85%] p-3.5 rounded-2xl rounded-tl-sm text-[13px] flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
          </section>

          <section className="p-4 border-t border-slate-100 shrink-0 bg-white rounded-b-2xl">
            <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 text-slate-500 focus-within:border-[#1565d8] focus-within:ring-2 focus-within:ring-[#1565d8]/20 transition-all shadow-inner shadow-slate-50">
              <input
                aria-label="Preguntar al asistente..."
                placeholder="Preguntar al asistente..."
                className="w-full bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
                ref={messageForAi}
                onKeyDown={e => { if (e.key === 'Enter') handleAskAI() }}
              />
              <button
                type="button"
                onClick={handleAskAI}
                className="w-8 h-8 flex items-center justify-center bg-[#1565d8] hover:bg-[#124fa8] text-white rounded-lg transition-colors"
              >
                <IconArrowRight />
              </button>
            </div>
          </section>
        </section>
      </div>
    </MainPanel>
  )
}

function Message({ sender, text, tokens }: { sender: string; text: string; tokens?: number }) {
  const isDoctor = sender === 'doctor'
  return (
    <div className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
      <div className={`w-[95%] p-3.5 rounded-2xl text-[13px] leading-relaxed ${
        isDoctor
          ? 'bg-[#1565d8] text-white rounded-tr-sm shadow-sm ml-auto'
          : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm mr-auto'
      }`}>
        <div className={`markdown-body text-left max-w-none ${isDoctor ? 'text-white' : 'text-slate-700'} 
          [&>p]:leading-relaxed [&>p]:mb-2.5 [&>p:last-child]:mb-0
          [&>h3]:font-bold [&>h3]:text-[14px] [&>h3]:mb-2 [&>h3]:mt-3 [&>h3]:text-[#1565d8]
          [&>h4]:font-bold [&>h4]:text-[13px] [&>h4]:mb-1.5 [&>h4]:mt-2 [&>h4]:text-slate-800
          [&>strong]:font-bold [&>strong]:text-slate-900
          [&>ul]:list-disc [&>ul]:ml-4 [&>ul]:mb-3 [&>ul]:space-y-1.5
          [&>ol]:list-decimal [&>ol]:ml-4 [&>ol]:mb-3 [&>ol]:space-y-1.5
          [&_li]:pl-1 [&_li>strong]:text-[#1565d8]
          [&>hr]:hidden
        `}>
          {isDoctor ? (
            <p className="whitespace-pre-wrap mb-0">{text}</p>
          ) : (
            <ReactMarkdown>{text}</ReactMarkdown>
          )}
        </div>
        {tokens !== undefined && (
          <div className={`mt-2 text-[10px] flex items-center justify-end font-medium ${isDoctor ? 'text-blue-200' : 'text-slate-400'}`}>
            <span>{tokens} tkns</span>
          </div>
        )}
      </div>
    </div>
  )
}
