import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import isAuthenticated from '../../../lib/is-authenticated'
import MainPanel from '../../../components/main-panel'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import fetchWithToken from '../../../lib/fetch-with-token'

export const Route = createFileRoute('/doctor/pacientes/')({
  component: RouteComponent,
  beforeLoad: isAuthenticated
})

type pacientesTemporal = {
  creadoPorId: number
  nombre: string
  edad: number
  sexo: string
  documento: string
  id: number
}

const ITEMS_POR_PAGINA = 10

function RouteComponent() {
  const [search, setSearch] = useState('')
  const [pagina, setPagina] = useState(1)
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['pacientes'],
    queryFn: async () => {
      const res = await fetchWithToken<{ pacientes: pacientesTemporal[] }>('/api/pacientes', {
        headers: {
          'content-type': 'application/json'
        },
        method: 'GET'
      })

      return res.data?.pacientes as unknown as pacientesTemporal[]
    },
  })

  const pacientesFiltrados = useMemo(() =>
    data ? data.filter(p =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.documento.toLowerCase().includes(search.toLowerCase())
    ) : [], [search, data])

  const totalPaginas = Math.max(1, Math.ceil(pacientesFiltrados.length / ITEMS_POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const pacientesPaginados = useMemo(() =>
    pacientesFiltrados.slice((paginaActual - 1) * ITEMS_POR_PAGINA, paginaActual * ITEMS_POR_PAGINA),
    [pacientesFiltrados, paginaActual]
  )

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editandoPaciente, setEditandoPaciente] = useState<pacientesTemporal | null>(null)

  const [nuevoPaciente, setNuevoPaciente] = useState<Omit<pacientesTemporal, 'id' | 'creadoPorId'>>({
    nombre: "",
    edad: 0,
    sexo: "",
    documento: "",
  })

  const handleDeletePaciente = async (id: number) => {
    await fetchWithToken(`/api/pacientes/${id}`, {
      headers: {
        'content-type': 'application/json'
      },
      method: 'DELETE'
    })

    queryClient.invalidateQueries({ queryKey: ['pacientes'] })
  }

  const handleEditPaciente = async (id: number, updatedData: Partial<pacientesTemporal>) => {
    const res = await fetchWithToken(`/api/pacientes/${id}`, {
      headers: {
        'content-type': 'application/json'
      },
      method: 'PUT',
      body: JSON.stringify(updatedData)
    })

    if (!res.success) return;

    queryClient.invalidateQueries({ queryKey: ['pacientes'] })
  }

  const handleCrearPaciente = async () => {
    const res = await fetchWithToken('/api/pacientes', {
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(nuevoPaciente)
    })

    if (!res.success) return;


    queryClient.invalidateQueries({ queryKey: ['pacientes'] })

    setNuevoPaciente({
      nombre: "",
      edad: 0,
      sexo: "",
      documento: "",
    })

    setMostrarFormulario(false)
  }

  return (
    <MainPanel>
      <section className="space-y-6 p-6">

        {/* Header */}
        <div>
          <h1 className="text-[24px] font-bold text-slate-900">Pacientes</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Gestiona y consulta la información de todos los pacientes registrados.</p>
        </div>

        {/* Tabla de Pacientes */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <h2 className="text-[14px] font-bold text-slate-800">Lista de Pacientes</h2>
              <div className="flex gap-2">
                <button type="button" className="text-[12px] font-semibold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  Exportar
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(true)}
                  className="text-[12px] font-semibold text-white bg-[#1565d8] px-3 py-1.5 rounded-lg hover:bg-[#0f56bd] transition-colors"
                >
                  + Nuevo Paciente
                </button>
              </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="px-5 py-3 border-b border-slate-100 shrink-0">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">🔍</span>
                  <input
                    aria-label="Buscar pacientes"
                    type="text"
                    placeholder="Buscar pacientes por nombre, tipo..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPagina(1) }}
                    className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#1565d8] focus:ring-2 focus:ring-[#1565d8]/10 transition-colors"
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[11px]">✕</button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 min-h-0">
              <table className="w-full">
                <thead className="bg-slate-50/80 sticky top-0 z-10">
                  <tr>
                    {['Edad', 'Nombre del Paciente', 'Tipo', 'Acciones'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-[13px] text-slate-400">
                        Cargando pacientes...
                      </td>
                    </tr>
                  ) : pacientesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-[13px] text-slate-400">
                        No se encontraron pacientes para "{search}"
                      </td>
                    </tr>
                  ) : pacientesPaginados.map((p) => {
                    return (
                      <tr key={p.id}>
                        <td className="px-5 py-3.5 text-[12px] font-semibold text-slate-400">{p.edad}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#1565d8]/10 text-[#1565d8] flex items-center justify-center text-[11px] font-bold shrink-0">
                              {p.nombre.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[13px] font-semibold text-slate-700">{p.nombre}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-slate-500">{p.documento}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditandoPaciente(p)}
                              className="text-[11px] font-semibold text-[#1565d8] hover:text-[#0f56bd] px-2 py-1 rounded border border-[#1565d8]/30 hover:bg-[#1565d8]/5 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`¿Eliminar a ${p.nombre}?`)) {
                                  handleDeletePaciente(p.id)
                                }
                              }}
                              className="text-[11px] font-semibold text-red-500 hover:text-red-600 px-2 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 shrink-0">
              <p className="text-[11px] text-slate-400">Mostrando {pacientesFiltrados.length} de {pacientesFiltrados.length} pacientes</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >‹</button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setPagina(n)}
                    className={`w-7 h-7 flex items-center justify-center rounded text-[12px] font-semibold transition-colors ${n === paginaActual
                      ? 'bg-[#1565d8] text-white'
                      : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                  >{n}</button>
                ))}
                <button
                  type="button"
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:bg-slate-50 text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >›</button>
              </div>
            </div>
          </div>

        {/* Modal Nuevo Paciente */}
        {mostrarFormulario && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">

            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Nuevo Paciente
                  </h2>

                  <p className="text-sm text-slate-500">
                    Complete la información del paciente.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="text-2xl text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="grid grid-cols-2 gap-5 p-6">

                <div>
                  <label className="mb-2 block text-sm font-semibold" htmlFor="nuevo-nombre">
                    Nombre Completo
                  </label>

                  <input
                    id="nuevo-nombre"
                    type="text"
                    value={nuevoPaciente.nombre}
                    onChange={(e) =>
                      setNuevoPaciente({
                        ...nuevoPaciente,
                        nombre: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#1565d8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold" htmlFor="nuevo-edad">
                    Edad
                  </label>

                  <input
                    id="nuevo-edad"
                    type="number"
                    value={nuevoPaciente.edad}
                    onChange={(e) =>
                      setNuevoPaciente({
                        ...nuevoPaciente,
                        edad: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#1565d8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold" htmlFor="nuevo-sexo">
                    Sexo
                  </label>

                  <select
                    id="nuevo-sexo"
                    value={nuevoPaciente.sexo}
                    onChange={(e) =>
                      setNuevoPaciente({
                        ...nuevoPaciente,
                        sexo: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#1565d8] focus:outline-none"
                  >
                    <option value="">Seleccione...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold" htmlFor="nuevo-documento">
                    Documento
                  </label>

                  <input
                    id="nuevo-documento"
                    type="text"
                    value={nuevoPaciente.documento}
                    onChange={(e) =>
                      setNuevoPaciente({
                        ...nuevoPaciente,
                        documento: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#1565d8] focus:outline-none"
                  />
                </div>

              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium hover:bg-slate-100"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleCrearPaciente}
                  className="rounded-lg bg-[#1565d8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0f56bd]"
                >
                  Guardar Paciente
                </button>

              </div>

            </div>

          </div>
        )}

        {/* Modal Editar Paciente */}
        {editandoPaciente && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Editar Paciente</h2>
                  <p className="text-sm text-slate-500">Actualice la información del paciente.</p>
                </div>
                <button type="button" onClick={() => setEditandoPaciente(null)} className="text-2xl text-slate-400 hover:text-slate-700">×</button>
              </div>
              <div className="grid grid-cols-2 gap-5 p-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold" htmlFor="edit-nombre">Nombre Completo</label>
                  <input
                    id="edit-nombre"
                    type="text"
                    value={editandoPaciente.nombre}
                    onChange={e => setEditandoPaciente({ ...editandoPaciente, nombre: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#1565d8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold" htmlFor="edit-edad">Edad</label>
                  <input
                    id="edit-edad"
                    type="number"
                    value={editandoPaciente.edad}
                    onChange={e => setEditandoPaciente({ ...editandoPaciente, edad: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#1565d8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold" htmlFor="edit-documento">Documento</label>
                  <input
                    id="edit-documento"
                    type="text"
                    value={editandoPaciente.documento}
                    onChange={e => setEditandoPaciente({ ...editandoPaciente, documento: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-[#1565d8] focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button type="button" onClick={() => setEditandoPaciente(null)} className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium hover:bg-slate-100">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleEditPaciente(editandoPaciente.id, {
                      nombre: editandoPaciente.nombre,
                      edad: editandoPaciente.edad,
                      documento: editandoPaciente.documento,
                    })
                    setEditandoPaciente(null)
                  }}
                  className="rounded-lg bg-[#1565d8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0f56bd]"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

      </section>
    </MainPanel>
  )
}