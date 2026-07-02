import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import isAuthenticated from '../../../lib/is-authenticated'
import MainPanel from '../../../components/main-panel'
 
export const Route = createFileRoute('/admin/medicos/')({
  component: RouteComponent,
  beforeLoad: isAuthenticated
})
 
interface Medico {
  id: string
  nombre: string
  email: string
  especialidad: string
  licencia: string
  estado: 'ACTIVO' | 'INACTIVO' | 'PENDIENTE'
  telefono: string
  iniciales: string
  pacientes: number
  consultasHoy: number
  calificacion: number
}
 
const ESPECIALIDADES = [
  'Cardiología',
  'Neurología',
  'Oncología',
  'Pediatría',
  'Psiquiatría',
  'Cirugía General',
  'Oftalmología',
  'Dermatología',
  'Gastroenterología',
  'Neumología',
]
 
const MEDICOS: Medico[] = [
  {
    id: '1',
    nombre: 'Dra. Laura Méndez',
    email: 'laura.mendez@medreason.ai',
    especialidad: 'Cardiología',
    licencia: 'LIC-001-2024',
    estado: 'ACTIVO',
    telefono: '+1 (555) 001-0001',
    iniciales: 'LM',
    pacientes: 45,
    consultasHoy: 8,
    calificacion: 4.8
  },
  {
    id: '2',
    nombre: 'Dr. Carlos Ramírez',
    email: 'carlos.ramirez@medreason.ai',
    especialidad: 'Neurología',
    licencia: 'LIC-002-2024',
    estado: 'ACTIVO',
    telefono: '+1 (555) 002-0002',
    iniciales: 'CR',
    pacientes: 52,
    consultasHoy: 6,
    calificacion: 4.7
  },
  {
    id: '3',
    nombre: 'Dra. Ana Castillo',
    email: 'ana.castillo@medreason.ai',
    especialidad: 'Oncología',
    licencia: 'LIC-003-2024',
    estado: 'PENDIENTE',
    telefono: '+1 (555) 003-0003',
    iniciales: 'AC',
    pacientes: 28,
    consultasHoy: 3,
    calificacion: 4.6
  },
  {
    id: '4',
    nombre: 'Dr. Miguel Torres',
    email: 'miguel.torres@medreason.ai',
    especialidad: 'Cirugía General',
    licencia: 'LIC-004-2024',
    estado: 'ACTIVO',
    telefono: '+1 (555) 004-0004',
    iniciales: 'MT',
    pacientes: 38,
    consultasHoy: 5,
    calificacion: 4.9
  },
  {
    id: '5',
    nombre: 'Dra. Patricia Sáenz',
    email: 'patricia.saenz@medreason.ai',
    especialidad: 'Pediatría',
    licencia: 'LIC-005-2024',
    estado: 'INACTIVO',
    telefono: '+1 (555) 005-0005',
    iniciales: 'PS',
    pacientes: 0,
    consultasHoy: 0,
    calificacion: 4.5
  },
  {
    id: '6',
    nombre: 'Dr. Roberto Gómez',
    email: 'roberto.gomez@medreason.ai',
    especialidad: 'Gastroenterología',
    licencia: 'LIC-006-2024',
    estado: 'ACTIVO',
    telefono: '+1 (555) 006-0006',
    iniciales: 'RG',
    pacientes: 41,
    consultasHoy: 7,
    calificacion: 4.4
  },
]
 
const STATUS_CONFIG = {
  ACTIVO: { label: 'Activo', classes: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  INACTIVO: { label: 'Inactivo', classes: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  PENDIENTE: { label: 'Pendiente', classes: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
}
 
function RouteComponent() {
  const [search, setSearch] = useState('')
  const [especialidadFilter, setEspecialidadFilter] = useState('Todas')
  const [estadoFilter, setEstadoFilter] = useState('Todos')
  const [medicoSeleccionado, setMedicoSeleccionado] = useState<Medico | null>(null)
 
  const medicosFiltrados = useMemo(() =>
    MEDICOS.filter(m => {
      const matchSearch = m.nombre.toLowerCase().includes(search.toLowerCase()) ||
                         m.email.toLowerCase().includes(search.toLowerCase())
      const matchEspecialidad = especialidadFilter === 'Todas' || m.especialidad === especialidadFilter
      const matchEstado = estadoFilter === 'Todos' || m.estado === estadoFilter
      return matchSearch && matchEspecialidad && matchEstado
    }), [search, especialidadFilter, estadoFilter]
  )
 
  return (
    <MainPanel>
      <section className="space-y-6 p-6">
 
        {/* Header */}
        <div>
          <h1 className="text-[24px] font-bold text-slate-900">Médicos del Sistema</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Directorio de médicos activos, especialidades y desempeño general.</p>
        </div>
 
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 mb-1">Total Médicos</p>
            <p className="text-[28px] font-bold text-slate-900">{MEDICOS.length}</p>
            <p className="text-[11px] text-slate-400 mt-1">En el sistema</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 mb-1">Médicos Activos</p>
            <p className="text-[28px] font-bold text-emerald-600">{MEDICOS.filter(m => m.estado === 'ACTIVO').length}</p>
            <p className="text-[11px] text-slate-400 mt-1">Disponibles ahora</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 mb-1">Consultas Hoy</p>
            <p className="text-[28px] font-bold text-blue-600">{MEDICOS.reduce((sum, m) => sum + m.consultasHoy, 0)}</p>
            <p className="text-[11px] text-slate-400 mt-1">Total programadas</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-medium text-slate-500 mb-1">Calificación Promedio</p>
            <p className="text-[28px] font-bold text-amber-600">
              {(MEDICOS.reduce((sum, m) => sum + m.calificacion, 0) / MEDICOS.length).toFixed(1)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">De 5.0 estrellas</p>
          </div>
        </div>
 
        {/* Tabla de Médicos */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm overflow-hidden">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-[14px] font-bold text-slate-800">Directorio de Médicos</h2>
          </div>
 
          {/* Filtros */}
          <div className="px-5 py-4 border-b border-slate-100 space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">🔍</span>
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1565d8] focus:ring-2 focus:ring-[#1565d8]/10 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[11px]">✕</button>
              )}
            </div>
 
            <div className="flex gap-3">
              <select
                value={especialidadFilter}
                onChange={e => setEspecialidadFilter(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 outline-none focus:border-[#1565d8] focus:ring-2 focus:ring-[#1565d8]/10 cursor-pointer"
              >
                <option value="Todas">Todas las especialidades</option>
                {ESPECIALIDADES.map(esp => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
 
              <select
                value={estadoFilter}
                onChange={e => setEstadoFilter(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 outline-none focus:border-[#1565d8] focus:ring-2 focus:ring-[#1565d8]/10 cursor-pointer"
              >
                <option value="Todos">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="PENDIENTE">Pendiente</option>
              </select>
            </div>
          </div>
 
          {/* Tabla */}
          <table className="w-full">
            <thead className="bg-slate-50/80">
              <tr>
                {['Médico', 'Especialidad', 'Estado', 'Pacientes', 'Consultas Hoy', 'Calificación'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {medicosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-slate-400">
                    No se encontraron médicos con los filtros aplicados
                  </td>
                </tr>
              ) : medicosFiltrados.map((m) => {
                const s = STATUS_CONFIG[m.estado]
                return (
                  <tr 
                    key={m.id} 
                    onClick={() => setMedicoSeleccionado(m)}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#1565d8]/10 text-[#1565d8] flex items-center justify-center text-[11px] font-bold shrink-0">
                          {m.iniciales}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-slate-700">{m.nombre}</p>
                          <p className="text-[11px] text-slate-400">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-slate-600">{m.especialidad}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.classes}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-semibold text-slate-700">{m.pacientes}</p>
                      <p className="text-[11px] text-slate-400">pacientes</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-bold text-blue-600">{m.consultasHoy}</p>
                      <p className="text-[11px] text-slate-400">programadas</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[13px] font-bold text-amber-600">{m.calificacion}</span>
                        <span className="text-[12px]">⭐</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
 
          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">
              Mostrando {medicosFiltrados.length} de {MEDICOS.length} médicos
            </p>
          </div>
        </div>
 
      </section>
 
      {/* Modal Detalle Médico */}
      {medicoSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)] w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-[15px] font-bold text-slate-800">Información del Médico</h2>
              <button 
                onClick={() => setMedicoSeleccionado(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors text-lg"
              >
                ✕
              </button>
            </div>
 
            <div className="px-6 py-5">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-[#1565d8]/10 text-[#1565d8] flex items-center justify-center text-[20px] font-bold">
                  {medicoSeleccionado.iniciales}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-slate-900">{medicoSeleccionado.nombre}</p>
                  <p className="text-[13px] text-slate-500 mt-0.5">{medicoSeleccionado.especialidad}</p>
                </div>
              </div>
 
              {/* Información */}
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400 mb-1">Email</p>
                  <p className="text-[13px] text-slate-700">{medicoSeleccionado.email}</p>
                </div>
 
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400 mb-1">Teléfono</p>
                  <p className="text-[13px] text-slate-700">{medicoSeleccionado.telefono}</p>
                </div>
 
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400 mb-1">Licencia</p>
                  <p className="text-[13px] font-mono text-slate-700">{medicoSeleccionado.licencia}</p>
                </div>
 
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400 mb-1">Pacientes</p>
                    <p className="text-[18px] font-bold text-slate-900">{medicoSeleccionado.pacientes}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400 mb-1">Calificación</p>
                    <div className="flex items-center gap-1">
                      <span className="text-[18px] font-bold text-amber-600">{medicoSeleccionado.calificacion}</span>
                      <span>⭐</span>
                    </div>
                  </div>
                </div>
 
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-400 mb-2">Estado</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_CONFIG[medicoSeleccionado.estado].classes}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[medicoSeleccionado.estado].dot}`} />
                    {STATUS_CONFIG[medicoSeleccionado.estado].label}
                  </span>
                </div>
              </div>
            </div>
 
            <div className="px-6 pb-5">
              <button 
                onClick={() => setMedicoSeleccionado(null)}
                className="w-full h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-semibold rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
 
    </MainPanel>
  )
}