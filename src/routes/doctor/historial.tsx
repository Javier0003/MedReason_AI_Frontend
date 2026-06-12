import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Sidebar } from '../../components/sidebar'

export const Route = createFileRoute('/doctor/historial')({
  component: RouteComponent,
})

// ─── Tipos ─────────────────────────────────────────────────────────────────────
interface Consulta {
  id: string
  fecha: string
  hora: string
  paciente: string
  iniciales: string
  diagnostico: string
  tipoDx: 'Hypertension' | 'Diabetes' | 'Respiratory' | 'Physical' | 'Cardiology'
  medico: string
  medicoColor: string
  status: 'COMPLETED' | 'PENDING' | 'URGENT'
}

type RangoFecha = 'Hoy' | 'Últimos 7 días' | 'Últimos 30 días' | 'Rango personalizado'
type TipoDx    = 'Todos los diagnósticos' | 'Hypertension' | 'Diabetes' | 'Respiratory' | 'Physical' | 'Cardiology'

// ─── Mock data ─────────────────────────────────────────────────────────────────
const CONSULTAS: Consulta[] = [
  { id:'1', fecha:'24 Oct, 2023', hora:'10:30 AM', paciente:'Sarah Jenkins',  iniciales:'SJ', diagnostico:'Control de Hipertensión',   tipoDx:'Hypertension', medico:'Dr. Alexander Thorne',  medicoColor:'bg-blue-100 text-blue-700',   status:'COMPLETED' },
  { id:'2', fecha:'23 Oct, 2023', hora:'02:15 PM', paciente:'Michael Chen',   iniciales:'MC', diagnostico:'Seguimiento Diabetes Tipo 2',  tipoDx:'Diabetes',     medico:'Dr. Elena Rodriguez',   medicoColor:'bg-purple-100 text-purple-700',status:'COMPLETED' },
  { id:'3', fecha:'22 Oct, 2023', hora:'09:00 AM', paciente:'Linda Thompson', iniciales:'LT', diagnostico:'Bronquitis Aguda',           tipoDx:'Respiratory',  medico:'Dr. Alexander Thorne',  medicoColor:'bg-blue-100 text-blue-700',   status:'PENDING'   },
  { id:'4', fecha:'21 Oct, 2023', hora:'11:45 AM', paciente:'David Miller',   iniciales:'DM', diagnostico:'Examen Físico General',       tipoDx:'Physical',     medico:'Dr. Sarah Williams',    medicoColor:'bg-green-100 text-green-700', status:'COMPLETED' },
  { id:'5', fecha:'20 Oct, 2023', hora:'03:00 PM', paciente:'Emma Wilson',    iniciales:'EW', diagnostico:'Revisión de Arritmia Cardíaca',  tipoDx:'Cardiology',   medico:'Dr. Elena Rodriguez',   medicoColor:'bg-purple-100 text-purple-700',status:'URGENT'    },
  { id:'6', fecha:'19 Oct, 2023', hora:'08:30 AM', paciente:'James Carter',   iniciales:'JC', diagnostico:'Control de Hipertensión',   tipoDx:'Hypertension', medico:'Dr. Alexander Thorne',  medicoColor:'bg-blue-100 text-blue-700',   status:'COMPLETED' },
]

const STATUS_CONFIG = {
  COMPLETED: { label: 'Completado', classes: 'bg-emerald-100 text-emerald-700' },
  PENDING:   { label: 'Pendiente',   classes: 'bg-amber-100 text-amber-700'     },
  URGENT:    { label: 'Urgente',    classes: 'bg-red-100 text-red-600'         },
}

const DX_STATS = [
  { label: 'Hipertensión',  count: 2, color: 'bg-blue-500',   pct: 33 },
  { label: 'Diabetes',      count: 1, color: 'bg-purple-500', pct: 17 },
  { label: 'Respiratorio',  count: 1, color: 'bg-teal-500',   pct: 17 },
  { label: 'Cardiología',   count: 1, color: 'bg-red-500',    pct: 17 },
  { label: 'Examen Físico', count: 1, color: 'bg-green-500',  pct: 16 },
]

const RANGOS: RangoFecha[] = ['Hoy', 'Últimos 7 días', 'Últimos 30 días', 'Rango personalizado']
const TIPOS: TipoDx[]      = ['Todos los diagnósticos', 'Hypertension', 'Diabetes', 'Respiratory', 'Physical', 'Cardiology']

const DX_LABELS_ES: Record<string, string> = {
  'Todos los diagnósticos': 'Todos los diagnósticos',
  'Hypertension': 'Hipertensión',
  'Diabetes': 'Diabetes',
  'Respiratory': 'Respiratorio',
  'Physical': 'Examen Físico',
  'Cardiology': 'Cardiología'
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS  = ['D','L','M','M','J','V','S']

// ─── Mini Calendario (para el modal) ──────────────────────────────────────────
function MiniCalendario({ label, fecha, onChange }: { label: string; fecha: Date; onChange: (d: Date) => void }) {
  const [mes,  setMes]  = useState(fecha.getMonth())
  const [anio, setAnio] = useState(fecha.getFullYear())
  
  const primerDia = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  
  const celdas    = Array.from({ length: primerDia + diasEnMes }, (_, i) =>
    i < primerDia ? null : i - primerDia + 1
  )
  
  const anterior  = () => mes === 0  ? (setMes(11), setAnio(a => a - 1)) : setMes(m => m - 1)
  const siguiente = () => mes === 11 ? (setMes(0),  setAnio(a => a + 1)) : setMes(m => m + 1)
  
  return (
    <div className="flex-1">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-3">{label}</p>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-bold text-slate-700">{MESES[mes]} {anio}</span>
        <div className="flex gap-1">
          <button onClick={anterior}  className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 text-xs">‹</button>
          <button onClick={siguiente} className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 text-xs">›</button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DIAS.map((d, i) => <div key={i} className="text-center text-[9px] font-bold text-slate-400 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {celdas.map((dia, i) => {
          if (!dia) return <div key={i} />
          const seleccionado = dia === fecha.getDate() && mes === fecha.getMonth() && anio === fecha.getFullYear()
          return (
            <button 
              key={i} 
              onClick={() => onChange(new Date(anio, mes, dia))}
              className={`w-7 h-7 mx-auto flex items-center justify-center rounded-full text-[12px] transition-colors ${
                seleccionado ? 'bg-[#1565d8] text-white font-bold' : 'text-slate-600 hover:bg-[#1565d8]/10 hover:text-[#1565d8]'
              }`}
            >
              {dia}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────────
function RouteComponent() {
  const [rango,       setRango]       = useState<RangoFecha>('Últimos 30 días')
  const [tipoDx,      setTipoDx]      = useState<TipoDx>('Todos los diagnósticos')
  const [modalRango,  setModalRango]  = useState(false)
  const [fechaDesde,  setFechaDesde]  = useState(new Date(2023, 9, 1))
  const [fechaHasta,  setFechaHasta]  = useState(new Date(2023, 9, 31))
  const [modalDetalle, setModalDetalle] = useState<Consulta | null>(null)

  const consultas = useMemo(() =>
    CONSULTAS.filter(c => tipoDx === 'Todos los diagnósticos' || c.tipoDx === tipoDx),
    [tipoDx]
  )

  const handleApplyFilters = () => {
    if (rango === 'Rango personalizado') setModalRango(true)
  }

  return (
    <div className="flex min-h-screen bg-[#f3f4f7]">
      <Sidebar role="DOCTOR" />

      <main className="ml-[200px] flex-1 p-6 space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-[22px] font-bold text-slate-900">Historial de Pacientes</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Acceda y gestione registros clínicos completos e historiales de consultas previas.</p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-1.5">Total de Registros</p>
                <p className="text-[32px] font-bold text-slate-900 leading-none">1,284</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#1565d8]/10 flex items-center justify-center text-[18px]">🗂️</div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-1.5">Derivaciones Urgentes</p>
                <p className="text-[32px] font-bold text-slate-900 leading-none">24</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[18px]">⚠️</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3">
          <select
            value={rango}
            onChange={e => setRango(e.target.value as RangoFecha)}
            className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1565d8]/20 cursor-pointer"
          >
            {RANGOS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            value={tipoDx}
            onChange={e => setTipoDx(e.target.value as TipoDx)}
            className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1565d8]/20 cursor-pointer"
          >
            {TIPOS.map(t => <option key={t} value={t}>{DX_LABELS_ES[t]}</option>)}
          </select>

          <button
            onClick={handleApplyFilters}
            className="h-9 px-4 bg-[#1565d8] hover:bg-[#0f56bd] text-white text-[13px] font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            ✦ Aplicar Filtros
          </button>

          {rango === 'Rango personalizado' && (
            <span className="text-[12px] text-slate-400 font-medium">
              {fechaDesde.toLocaleDateString('es-ES', { month:'short', day:'numeric' })} — {fechaHasta.toLocaleDateString('es-ES', { month:'short', day:'numeric', year:'numeric' })}
              <button onClick={() => setModalRango(true)} className="ml-2 text-[#1565d8] hover:underline">Editar</button>
            </span>
          )}
        </div>

        {/* Tabla + Stats */}
        <div className="grid grid-cols-3 gap-4">

          {/* Tabla */}
          <div className="col-span-2 rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-[14px] font-bold text-slate-800">Historial de Consultas Médicas</h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 transition-colors">⬇</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 transition-colors">🖨</button>
              </div>
            </div>

            <table className="w-full">
              <thead className="bg-slate-50/80">
                <tr>
                  {['Fecha', 'Paciente', 'Diagnóstico', 'Médico Tratante', 'Estado', 'Acción'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consultas.map(c => {
                  const s = STATUS_CONFIG[c.status]
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="text-[12px] font-semibold text-slate-700">{c.fecha}</p>
                        <p className="text-[11px] text-slate-400">{c.hora}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#1565d8]/10 text-[#1565d8] flex items-center justify-center text-[10px] font-bold shrink-0">{c.iniciales}</div>
                          <span className="text-[13px] font-semibold text-slate-700">{c.paciente}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100">{c.diagnostico}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${c.medicoColor}`}>
                            {c.medico.split(' ').slice(-1)[0].charAt(0)}
                          </div>
                          <span className="text-[12px] text-slate-600">{c.medico}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${s.classes}`}>{s.label}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setModalDetalle(c)}
                          className="text-[11px] font-semibold text-slate-500 border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 hover:text-[#1565d8] hover:border-[#1565d8]/30 transition-colors"
                        >
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Paginación */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
              <p className="text-[11px] text-slate-400">Mostrando 1–{consultas.length} de 1,284 registros</p>
              <div className="flex items-center gap-1">
                <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 text-xs">‹</button>
                {[1,2,3,'...',129].map((p, i) => (
                  <button key={i} className={`w-7 h-7 flex items-center justify-center rounded text-[12px] font-semibold transition-colors
                    ${p === 1 ? 'bg-[#1565d8] text-white' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    {p}
                  </button>
                ))}
                <button className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 text-xs">›</button>
              </div>
            </div>
          </div>

          {/* Estadísticas de diagnósticos */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm p-5">
            <h3 className="text-[13px] font-bold text-slate-800 mb-4">Estadísticas de Diagnósticos</h3>
            <div className="space-y-4">
              {DX_STATS.map((dx, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-semibold text-slate-600">{dx.label}</span>
                    <span className="text-[11px] font-bold text-slate-400">{dx.count} casos</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${dx.color} rounded-full transition-all`} style={{ width: `${dx.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-3">Resumen de Estados</p>
              <div className="space-y-2">
                {[
                  { label: 'Completado', count: 4, color: 'bg-emerald-500' },
                  { label: 'Pendiente',   count: 1, color: 'bg-amber-500'   },
                  { label: 'Urgente',    count: 1, color: 'bg-red-500'     },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${s.color}`} />
                      <span className="text-[12px] text-slate-600">{s.label}</span>
                    </div>
                    <span className="text-[12px] font-bold text-slate-700">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Modal Custom Range ── */}
      {modalRango && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)] w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Rango de Fechas</p>
                <h2 className="text-[15px] font-bold text-slate-800">Seleccionar rango personalizado</h2>
              </div>
              <button onClick={() => setModalRango(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors text-lg">✕</button>
            </div>
            <div className="px-6 py-5 flex gap-6">
              <MiniCalendario label="Desde" fecha={fechaDesde} onChange={setFechaDesde} />
              <div className="w-px bg-slate-100" />
              <MiniCalendario label="Hasta"   fecha={fechaHasta} onChange={setFechaHasta} />
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setModalRango(false)} className="flex-1 h-10 border border-slate-200 text-slate-600 text-[13px] font-semibold rounded-lg hover:bg-slate-50 transition-colors">Cancelar</button>
              <button onClick={() => setModalRango(false)} className="flex-1 h-10 bg-[#1565d8] hover:bg-[#0f56bd] text-white text-[13px] font-semibold rounded-lg transition-colors">Aplicar Rango</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal View Details ── */}
      {modalDetalle && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)] w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Detalles de la Consulta</p>
                <h2 className="text-[15px] font-bold text-slate-800">{modalDetalle.paciente}</h2>
              </div>
              <button onClick={() => setModalDetalle(null)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors text-lg">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { label: 'Fecha y Hora',          value: `${modalDetalle.fecha} · ${modalDetalle.hora}` },
                { label: 'Diagnóstico',             value: modalDetalle.diagnostico },
                { label: 'Médico Tratante',   value: modalDetalle.medico },
                { label: 'Estado',                value: STATUS_CONFIG[modalDetalle.status].label },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-start">
                  <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wide">{row.label}</span>
                  <span className="text-[13px] font-semibold text-slate-700 text-right max-w-[60%]">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5">
              <button onClick={() => setModalDetalle(null)} className="w-full h-10 bg-[#1565d8] hover:bg-[#0f56bd] text-white text-[13px] font-semibold rounded-lg transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}