import { useState } from "react"
import { DIAS, MESES } from "../constants/constants"
import { TAREAS_MOCK, type Tarea } from "../routes/doctor/dashboard"

export default function Calendario({ onDiaClick }: { onDiaClick: (dia: number, tareas: Tarea[]) => void }) {
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