import { createFileRoute } from '@tanstack/react-router'
import MainPanel from '../../../components/main-panel'
import isAuthenticated from '../../../lib/is-authenticated'
import { useQuery } from '@tanstack/react-query'
import fetchWithToken from '../../../lib/fetch-with-token'

export const Route = createFileRoute('/admin/dashboard/')({
  component: RouteComponent,
  beforeLoad: isAuthenticated,
})

type Metricas = {
  totalConsultas: number
  tokensConsumidos: number
  usuariosActivos: number
}

function RouteComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-metricas'],
    queryFn: async () => {
      const res = await fetchWithToken<Metricas>('http://localhost:3000/api/admin/logs/metricas')
      if (!res.success) throw new Error(res.error || 'Error al obtener métricas')
      return res.data!
    },
  })

  return (
    <MainPanel>
      <section className="h-full overflow-y-auto px-6 py-6 space-y-6">
        <div>
          <h1 className="text-[24px] font-bold text-slate-900">Dashboard</h1>
          <p className="text-[13px] text-slate-400 mt-0.5">Métricas generales del sistema.</p>
        </div>

        {isLoading ? (
          <p className="text-[13px] text-slate-400">Cargando métricas...</p>
        ) : data ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-medium text-slate-500 mb-1">Total Consultas</p>
              <p className="text-[32px] font-bold text-slate-900">{data.totalConsultas.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400 mt-1">Consultas realizadas</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-medium text-slate-500 mb-1">Tokens Consumidos</p>
              <p className="text-[32px] font-bold text-blue-600">{data.tokensConsumidos.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400 mt-1">Por el modelo IA</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-medium text-slate-500 mb-1">Usuarios Activos</p>
              <p className="text-[32px] font-bold text-emerald-600">{data.usuariosActivos}</p>
              <p className="text-[11px] text-slate-400 mt-1">En el sistema</p>
            </div>
          </div>
        ) : null}
      </section>
    </MainPanel>
  )
}