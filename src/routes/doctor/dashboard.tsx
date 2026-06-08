import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Sidebar } from '../../components/sidebar.tsx'
 
export const Route = createFileRoute('/doctor/dashboard')({
  component: RouteComponent,
})
 
// ─── Tipos ─────────────────────────────────────────────────────────────────────
interface PacienteHoy {
  id: string
  hora: string
  nombre: string
  iniciales: string
  tipo: string
  status: 'COMPLETED' | 'IN_PROGRESS' | 'WAITING' | 'SCHEDULED'
}
 
interface Tarea {
  titulo: string
  tiempo: string
}
 
const STATUS_CONFIG = {
  COMPLETED:   { label: 'COMPLETADO',   classes: 'bg-emerald-100 text-emerald-700' },
  IN_PROGRESS: { label: 'EN PROGRESO', classes: 'bg-blue-100 text-blue-700' },
  WAITING:     { label: 'EN ESPERA',    classes: 'bg-amber-100 text-amber-700' },
  SCHEDULED:   { label: 'PROGRAMADO',   classes: 'bg-slate-100 text-slate-500' },
}
 
const PACIENTES_HOY: PacienteHoy[] = [
  { id: '1', hora: '09:00 AM', nombre: 'Arthur Wagner',  iniciales: 'AW', tipo: 'Seguimiento',       status: 'COMPLETED'   },
  { id: '2', hora: '10:30 AM', nombre: 'Maria Santos',   iniciales: 'MS', tipo: 'Consulta Inicial',  status: 'IN_PROGRESS' },
  { id: '3', hora: '11:15 AM', nombre: 'James Link',     iniciales: 'JL', tipo: 'Urgencia',          status: 'WAITING'     },
  { id: '4', hora: '01:45 PM', nombre: 'Emily Davis',    iniciales: 'ED', tipo: 'Revisión Radiológica', status: 'SCHEDULED'   },
]
 
const TAREAS_MOCK: Record<number, Tarea[]> = {
  5:  [
    { titulo: 'Aprobar resultados de patología para Sala 402', tiempo: 'Vence en 20 mins' },
    { titulo: 'Teleconsulta con el Dr. Aris', tiempo: 'Hoy, 4:30 PM' },
  ],
  12: [{ titulo: 'Reunión de personal — Sala de conferencias B', tiempo: '10:00 AM' }],
  18: [{ titulo: 'Revisar resultados de laboratorio — Paciente #882', tiempo: '2:00 PM' }],
}
 
const MESES = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE']
const DIAS  = ['D','L','M','M','J','V','S']
 
// ─── Calendario ────────────────────────────────────────────────────────────────
function Calendario({ onDiaClick }: { onDiaClick: (dia: number, tareas: Tarea[]) => void }) {
  const hoy = new Date()
  const [mes,  setMes]  = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())
 
  const primerDia = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()
  const celdas    = Array.from({ length: primerDia + diasEnMes }, (_, i) =>
    i < primerDia ? null : i - primerDia + 1
  )
 
  const anterior  = () => mes === 0  ? (setMes(11), setAnio(a => a - 1)) : setMes(m => m - 1)
  const siguiente = () => mes === 11 ? (setMes(0),  setAnio(a => a + 1)) : setMes(m => m + 1)
 
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-bold tracking-[0.1em] text-slate-700">{MESES[mes]} {anio}</span>
        <div className="flex gap-1">
          <button onClick={anterior}  className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 text-xs transition">‹</button>
          <button onClick={siguiente} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 text-xs transition">›</button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {DIAS.map((d, i) => <div key={i} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {celdas.map((dia, i) => {
          if (!dia) return <div key={i} />
          const esHoy       = dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()
          const tieneTareas = !!TAREAS_MOCK[dia]
          return (
            <button key={i} onClick={() => onDiaClick(dia, TAREAS_MOCK[dia] ?? [])}
              className={`relative w-8 h-8 mx-auto flex items-center justify-center rounded-full text-[13px] transition-colors
                ${esHoy ? 'bg-[#1565d8] text-white font-bold shadow-sm' : 'text-slate-600 hover:bg-[#1565d8]/10 hover:text-[#1565d8]'}`}>
              {dia}
              {tieneTareas && !esHoy && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1565d8]" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
 
// ─── Componente principal ──────────────────────────────────────────────────────
function RouteComponent() {
  const [search,   setSearch]   = useState('')
  const [modalDia, setModalDia] = useState<{ dia: number; tareas: Tarea[] } | null>(null)
  const tareasHoy = TAREAS_MOCK[new Date().getDate()] ?? []
 
  // Filtro de búsqueda
  const pacientesFiltrados = useMemo(() =>
    PACIENTES_HOY.filter(p =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.tipo.toLowerCase().includes(search.toLowerCase()) ||
      p.hora.toLowerCase().includes(search.toLowerCase())
    ), [search]
  )
 
  return (
    <div className="flex min-h-screen bg-[#f3f4f7]">
 
      {/* ── Sidebar ── */}
      <Sidebar role="DOCTOR" />
 
      {/* ── Contenido principal ── */}
      <main className="ml-[200px] flex-1 p-6 space-y-5">
 
        {/* Tarjetas métricas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-1.5">Total de Pacientes</p>
                <p className="text-[32px] font-bold text-slate-900 leading-none">1,284</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#1565d8]/10 flex items-center justify-center text-[18px]">👥</div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-1.5">Consultas Pendientes</p>
                <p className="text-[32px] font-bold text-slate-900 leading-none">12</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-[18px]">📋</div>
            </div>
          </div>
        </div>
 
        {/* Tabla + Calendario */}
        <div className="grid grid-cols-3 gap-4">
 
          {/* Tabla */}
          <div className="col-span-2 rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-[14px] font-bold text-slate-800">Pacientes de Hoy</h2>
              <div className="flex gap-2">
                <button className="text-[12px] font-semibold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">Exportar Lista</button>
                <button className="text-[12px] font-semibold text-white bg-[#1565d8] px-3 py-1.5 rounded-lg hover:bg-[#0f56bd] transition-colors">+ Añadir Paciente</button>
              </div>
            </div>
 
            {/* ── Barra de búsqueda ── */}
            <div className="px-5 py-3 border-b border-slate-100">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar pacientes o expedientes..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1565d8] focus:ring-2 focus:ring-[#1565d8]/10 transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[11px]">✕</button>
                )}
              </div>
            </div>
 
            <table className="w-full">
              <thead className="bg-slate-50/80">
                <tr>
                  {['Hora', 'Nombre del Paciente', 'Tipo', 'Estado'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pacientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-[13px] text-slate-400">
                      No se encontraron pacientes para "{search}"
                    </td>
                  </tr>
                ) : pacientesFiltrados.map((p) => {
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
 
          {/* Calendario */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm p-5 flex flex-col">
            <Calendario onDiaClick={(dia, tareas) => setModalDia({ dia, tareas })} />
            <div className="mt-4 pt-4 border-t border-slate-100 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Tareas Prioritarias</span>
              {tareasHoy.length === 0 ? (
                <p className="text-[12px] text-slate-400 mt-2">No hay tareas para hoy.</p>
              ) : (
                <div className="space-y-3 mt-3">
                  {tareasHoy.map((t, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1565d8] mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[12px] font-semibold text-slate-700 leading-snug">{t.titulo}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{t.tiempo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button className="w-full mt-4 py-2 text-[12px] font-semibold text-[#1565d8] hover:text-[#0f56bd] border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Ver Todas las Tareas
              </button>
            </div>
          </div>
        </div>
 
        {/* Modal */}
        {modalDia && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)] w-full max-w-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Tareas</p>
                  <h2 className="text-[15px] font-bold text-slate-800">
                    {MESES[new Date().getMonth()].charAt(0) + MESES[new Date().getMonth()].slice(1).toLowerCase()} {modalDia.dia}
                  </h2>
                </div>
                <button onClick={() => setModalDia(null)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors text-lg">✕</button>
              </div>
              <div className="px-6 py-5 space-y-3">
                {modalDia.tareas.length === 0 ? (
                  <p className="text-[13px] text-slate-400 text-center py-6">No hay tareas para este día.</p>
                ) : modalDia.tareas.map((t, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-[#1565d8] mt-1.5 shrink-0" />
                    <div>
                      <p className="text-[13px] font-semibold text-slate-700">{t.titulo}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{t.tiempo}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-5">
                <button onClick={() => setModalDia(null)} className="w-full h-10 bg-[#1565d8] hover:bg-[#0f56bd] text-white text-[13px] font-semibold rounded-lg transition-colors">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
 
      </main>
    </div>
  )
}
 