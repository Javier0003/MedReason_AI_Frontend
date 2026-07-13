import { createFileRoute } from '@tanstack/react-router'
import MainPanel from '../../../components/main-panel'
import isAuthenticated from '../../../lib/is-authenticated'
import { useQuery } from '@tanstack/react-query'
import fetchWithToken from '../../../lib/fetch-with-token'
import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import IconArrowRight from '../../../assets/svg/IconArrowRight'

type ConsultaData = {
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

export const Route = createFileRoute('/doctor/consulta/$id')({
  component: RouteComponent,
  beforeLoad: isAuthenticated,
})

const RIESGO_COLORS: Record<string, string> = {
  Alto: 'bg-rose-100 text-rose-700',
  Medio: 'bg-amber-100 text-amber-700',
  Bajo: 'bg-emerald-100 text-emerald-700',
}

function RouteComponent() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()

  const { data: consulta, isLoading, error } = useQuery({
    queryKey: ['consulta', id],
    queryFn: async () => {
      const res = await fetchWithToken<ConsultaData>(`http://localhost:3000/api/consulta/${id}`)
      if (!res.success || !res.data) throw new Error(res.error || 'Error al obtener consulta')
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

  const guardarCambios = async (data: { input?: string; output?: string; completed?: string }) => {
    setGuardando(true)
    try {
      const res = await fetchWithToken<ConsultaData>(`http://localhost:3000/api/consulta/${id}`, {
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
    const res = await fetchWithToken<{ answer: string }>('http://localhost:3000/api/chatbot/ask', {
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
          <p className="text-[13px] text-slate-400">Cargando consulta...</p>
        </div>
      </MainPanel>
    )
  }

  if (error) {
    return (
      <MainPanel>
        <div className="flex items-center justify-center h-full p-6">
          <div className="text-center space-y-2">
            <p className="text-[13px] text-red-500">Error al cargar la consulta</p>
            <p className="text-[12px] text-slate-400">{(error as Error).message}</p>
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
    setObservacionesEdit(consulta.output)
    setEditandoObservaciones(true)
  }

  return (
    <MainPanel>
      <div className="flex flex-row gap-3.5 h-full min-h-0">
        <section className="flex-1 overflow-y-auto pr-2 min-h-0">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] flex flex-row gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-[#1565d8]/10 flex items-center justify-center text-[#1565d8] font-bold text-xl shrink-0">
              {consulta.paciente.nombre.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-[17px] font-bold text-slate-900">{consulta.paciente.nombre}</p>
              <section className="flex gap-2 flex-row text-[13px] text-slate-400">
                <p>Documento: #{consulta.paciente.documento}</p>
                <span>·</span>
                <p>Dr. {consulta.doctor.nombre}</p>
                <span>·</span>
                <p>{new Date(consulta.createdAt).toLocaleDateString()}</p>
              </section>
            </div>
            <div className="flex items-center gap-3">
              {consulta.completed && (
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide bg-emerald-100 text-emerald-700">Completada</span>
              )}
              <span className={`px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide ${RIESGO_COLORS[consulta.nivelRiesgo] ?? 'bg-slate-100 text-slate-500'}`}>
                {consulta.nivelRiesgo}
              </span>
              <span className="text-[12px] text-slate-400">{consulta.tokens.toLocaleString()} tokens</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] flex flex-col gap-4 mb-5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-bold text-slate-700">Síntomas y datos clínicos</p>
              <div className="flex gap-2">
                {editandoSintomas ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditandoSintomas(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold"
                    >Cancelar</button>
                    <button
                      type="button"
                      onClick={() => guardarCambios({ input: sintomasEdit })}
                      disabled={guardando}
                      className="text-[11px] text-[#1565d8] hover:text-[#124fa8] font-semibold disabled:opacity-40"
                    >{guardando ? 'Guardando...' : 'Guardar'}</button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={iniciarEdicionSintomas}
                    className="text-[11px] text-[#1565d8] hover:text-[#124fa8] font-semibold"
                  >Editar</button>
                )}
              </div>
            </div>
            {editandoSintomas ? (
              <textarea
                value={sintomasEdit}
                onChange={e => setSintomasEdit(e.target.value)}
                rows={5}
                className="w-full border border-slate-200 rounded-lg p-3 text-[13px] focus:outline-none focus:border-[#1565d8] resize-none"
              />
            ) : (
              <p className="text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed">{consulta.input}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] flex flex-col gap-4 mb-5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-bold text-slate-700">Diagnóstico Generado (IA)</p>
              <div className="flex gap-2">
                {editandoObservaciones ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditandoObservaciones(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold"
                    >Cancelar</button>
                    <button
                      type="button"
                      onClick={() => guardarCambios({ output: observacionesEdit })}
                      disabled={guardando}
                      className="text-[11px] text-[#1565d8] hover:text-[#124fa8] font-semibold disabled:opacity-40"
                    >{guardando ? 'Guardando...' : 'Guardar'}</button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={iniciarEdicionObservaciones}
                    className="text-[11px] text-[#1565d8] hover:text-[#124fa8] font-semibold"
                  >Editar</button>
                )}
              </div>
            </div>
            {editandoObservaciones ? (
              <textarea
                value={observacionesEdit}
                onChange={e => setObservacionesEdit(e.target.value)}
                rows={6}
                className="w-full border border-slate-200 rounded-lg p-3 text-[13px] focus:outline-none focus:border-[#1565d8] resize-none"
              />
            ) : (
              <p className="text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed">{consulta.output}</p>
            )}
          </div>

          <div className="flex flex-row gap-2 justify-end">
            {(editandoSintomas || editandoObservaciones) && (
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={guardando}
                className="px-4 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-600 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                {guardando ? 'Guardando...' : 'Save Draft'}
              </button>
            )}
            <button
              type="button"
              onClick={handleCompleteConsultation}
              disabled={!!consulta.completed || guardando}
              className="px-4 py-2 bg-[#1565d8] text-white rounded-lg text-[13px] font-semibold hover:bg-[#124fa8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {consulta.completed ? 'Completada' : guardando ? 'Completando...' : 'Complete Consultation'}
            </button>
          </div>
        </section>

        <section className="w-80 bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] flex flex-col shrink-0 h-full min-h-0">
          <p className="text-[13px] font-bold text-slate-700 p-4 border-b border-slate-100 shrink-0">Clinical Insight AI</p>
          <section className="flex flex-col gap-3 flex-1 overflow-y-auto p-4 min-h-0">
            {messages.length === 0 && (
              <p className="text-[12px] text-slate-400 text-center mt-8">No hay mensajes aún. Escribe una pregunta para la IA.</p>
            )}
            {messages.map((message, index) => (
              <Message key={index} sender={message.sender} text={message.text} tokens={message.tokens} />
            ))}
          </section>

          <section className="p-4 border-t border-slate-100 shrink-0">
            <div className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-[#fbfbfc] px-3 text-slate-500 focus-within:border-[#1565d8] focus-within:ring-2 focus-within:ring-[#1565d8]/10">
              <input
                aria-label="Ask AI for suggestions"
                placeholder="Ask AI for suggestions..."
                className="w-full bg-transparent text-[13px] text-slate-700 outline-none placeholder:text-slate-400"
                ref={messageForAi}
                onKeyDown={e => { if (e.key === 'Enter') handleAskAI() }}
              />
              <button
                type="button"
                onClick={handleAskAI}
                className="text-slate-400 hover:text-slate-600"
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
      <div className={`max-w-xs p-3 rounded-lg text-[13px] ${isDoctor ? 'bg-[#1565d8] text-white' : 'bg-slate-100 text-slate-700'}`}>
        <p>{text}</p>
        {tokens !== undefined && (
          <span className="block mt-1.5 text-[10px] opacity-60 text-right">{tokens} tokens</span>
        )}
      </div>
    </div>
  )
}
