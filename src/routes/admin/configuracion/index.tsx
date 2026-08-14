import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import isAuthenticated from '../../../lib/is-authenticated'
import MainPanel from '../../../components/main-panel'
import fetchWithToken from '../../../lib/fetch-with-token'
import { showToast } from '../../../lib/toast'

export const Route = createFileRoute('/admin/configuracion/')({
  component: RouteComponent,
  beforeLoad: isAuthenticated
})

type IaConfig = {
  id: number
  modelName: string
  maxTokens: number
  temperatura: number
  systemPrompt: string
  updatedAt: string
}

type PromptVersion = {
  id: number
  version: string
  contenido: string
  activo: boolean
  creadoEn: string
}

function RouteComponent() {
  const queryClient = useQueryClient()
  const [guardando, setGuardando] = useState(false)
  const [creandoPV, setCreandoPV] = useState(false)

  const { data: configData } = useQuery({
    queryKey: ['admin-config'],
    queryFn: async () => {
      const res = await fetchWithToken<{ config: IaConfig }>('/api/admin/configSystem')
      if (!res.success || !res.data) throw new Error(res.error || 'Error')
      return res.data.config
    },
  })

  const { data: versions, refetch: refetchVersions } = useQuery({
    queryKey: ['admin-prompt-versions'],
    queryFn: async () => {
      const res = await fetchWithToken<{ versions: PromptVersion[] }>('/api/admin/configSystem/prompt-versions')
      if (!res.success || !res.data) throw new Error(res.error || 'Error')
      return res.data.versions
    },
  })

  const { data: availableModels } = useQuery({
    queryKey: ['admin-models'],
    queryFn: async () => {
      const res = await fetchWithToken<{ models: string[] }>('/api/admin/configSystem/models')
      if (!res.success || !res.data) throw new Error(res.error || 'Error')
      return res.data.models
    },
  })

  const [modelName, setModelName] = useState('')
  const [maxTokens, setMaxTokens] = useState(4000)
  const [temperatura, setTemperatura] = useState(0.1)
  const [systemPrompt, setSystemPrompt] = useState('')

  const [nuevaVersion, setNuevaVersion] = useState('')
  const [nuevoContenido, setNuevoContenido] = useState('')

  if (configData && !modelName && !guardando) {
    setModelName(configData.modelName)
    setMaxTokens(configData.maxTokens)
    setTemperatura(configData.temperatura)
    setSystemPrompt(configData.systemPrompt)
  }

  const guardarConfig = async () => {
    setGuardando(true)
    const body: Record<string, unknown> = {}
    if (modelName !== configData?.modelName) body.modelName = modelName
    if (maxTokens !== configData?.maxTokens) body.maxTokens = maxTokens
    if (temperatura !== configData?.temperatura) body.temperatura = temperatura
    if (systemPrompt !== configData?.systemPrompt) body.systemPrompt = systemPrompt
    if (Object.keys(body).length === 0) { setGuardando(false); return }
    const res = await fetchWithToken<{ config: IaConfig }>('/api/admin/configSystem', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.success) {
      queryClient.invalidateQueries({ queryKey: ['admin-config'] })
      showToast('Configuración Actualizada', 'La configuración del modelo de IA se ha guardado correctamente.', 'success')
    }
    setGuardando(false)
  }

  const crearPV = async () => {
    if (!nuevaVersion.trim() || !nuevoContenido.trim()) return
    setCreandoPV(true)
    const res = await fetchWithToken('/api/admin/configSystem/prompt-versions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: nuevaVersion.trim(), contenido: nuevoContenido.trim() }),
    })
    if (res.success) {
      setNuevaVersion('')
      setNuevoContenido('')
      refetchVersions()
      showToast('Versión Creada', 'La nueva versión del prompt ha sido registrada con éxito.', 'success')
    }
    setCreandoPV(false)
  }

  const activarPV = async (id: number) => {
    const res = await fetchWithToken(`/api/admin/configSystem/prompt-versions/${id}/activate`, { method: 'PUT' })
    if (res.success) {
      refetchVersions()
      showToast('Versión Activada', 'La versión de prompt ha sido activada correctamente.', 'success')
    }
  }

  const headerContent = (
    <div className="flex flex-1 items-center justify-between w-full">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Configuración de IA</h1>
        <p className="text-xs text-slate-500 mt-0.5">Administra el modelo, parámetros y prompts del sistema.</p>
      </div>
    </div>
  )

  return (
    <MainPanel headerContent={headerContent}>
      <section className="h-full overflow-y-auto px-6 py-6 space-y-6">


        {configData && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.06)] space-y-5">
            <h2 className="text-[15px] font-bold text-slate-800">Parámetros del Modelo</h2>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Modelo</label>
                <select value={modelName} onChange={e => setModelName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1565d8] bg-white">
                  {availableModels?.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Max Tokens</label>
                <input type="number" value={maxTokens} onChange={e => setMaxTokens(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1565d8]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Temperatura</label>
                <input type="number" step="0.01" value={temperatura} onChange={e => setTemperatura(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1565d8]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">System Prompt</label>
              <textarea rows={6} value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1565d8] resize-none font-mono" />
            </div>

            <button type="button" onClick={guardarConfig} disabled={guardando}
              className="px-5 py-2 bg-[#1565d8] text-white rounded-lg text-[13px] font-semibold hover:bg-[#124fa8] disabled:opacity-40 transition-colors">
              {guardando ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.06)] space-y-5">
          <h2 className="text-[15px] font-bold text-slate-800">Versiones de Prompt</h2>

          <div className="space-y-3">
            <div className="flex gap-3">
              <input placeholder="Versión (ej: v1.2)" value={nuevaVersion} onChange={e => setNuevaVersion(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1565d8]" />
              <button type="button" onClick={crearPV} disabled={creandoPV || !nuevaVersion.trim() || !nuevoContenido.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[13px] font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors shrink-0">
                {creandoPV ? 'Creando...' : 'Crear'}
              </button>
            </div>
            <textarea placeholder="Contenido del prompt..." rows={4} value={nuevoContenido} onChange={e => setNuevoContenido(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#1565d8] resize-none font-mono" />
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {versions?.map(v => (
              <div key={v.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                v.activo ? 'border-[#1565d8]/30 bg-[#1565d8]/5' : 'border-slate-100 bg-slate-50/50'
              }`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[13px] font-bold text-slate-700 shrink-0">{v.version}</span>
                  <span className="text-[11px] text-slate-400 truncate">{v.contenido.slice(0, 100)}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {v.activo ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Activo
                    </span>
                  ) : (
                    <button type="button" onClick={() => activarPV(v.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#1565d8] text-[#1565d8] hover:text-white border border-[#1565d8]/40 hover:border-transparent rounded-lg text-[11px] font-bold transition-all duration-200 shadow-xs active:scale-95 cursor-pointer">
                      <i className="fa-solid fa-play text-[9px]" />
                      Activar
                    </button>
                  )}
                </div>
              </div>
            ))}
            {(!versions || versions.length === 0) && (
              <p className="text-[12px] text-slate-400 text-center py-4">No hay versiones de prompt.</p>
            )}
          </div>
        </div>
      </section>
    </MainPanel>
  )
}
