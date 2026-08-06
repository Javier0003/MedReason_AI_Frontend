import { createFileRoute } from '@tanstack/react-router'
import MainPanel from '../../../components/main-panel'
import isAuthenticated from '../../../lib/is-authenticated'
import { useQuery } from '@tanstack/react-query'
import fetchWithToken from '../../../lib/fetch-with-token'
import { Link } from '@tanstack/react-router'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

export const Route = createFileRoute('/admin/dashboard/')({
  component: RouteComponent,
  beforeLoad: isAuthenticated,
})

type Metricas = {
  totalConsultas: number
  tokensConsumidos: number
  usuariosActivos: number
  tasaErrores: number
  actividadPorDia: { fecha: string; consultas: number; tokens: number }[]
  distribucionAcciones: { accion: string; cantidad: number }[]
}

type AuditAction =
  | 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
  | 'LOGIN' | 'LOGOUT'
  | 'EXPORT'
  | 'ERROR' | 'AUTH_FAILED'
  | 'CONSULTA_AI'

type AuditLogEntry = {
  id: number
  userId: number
  accion: AuditAction
  entidad: string
  entidadId: number | null
  detalle: string
  createdAt: string
  user: { id: number; nombre: string; email: string } | null
}

type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'CREAR',
  READ: 'LEER',
  UPDATE: 'ACTUALIZAR',
  DELETE: 'ELIMINAR',
  LOGIN: 'INICIO SESIÓN',
  LOGOUT: 'CIERRE SESIÓN',
  EXPORT: 'EXPORTAR',
  ERROR: 'ERROR',
  AUTH_FAILED: 'AUTENTICACIÓN FALLIDA',
  CONSULTA_AI: 'CONSULTA IA',
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-700',
  READ: 'bg-sky-100 text-sky-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-green-100 text-green-700',
  LOGOUT: 'bg-orange-100 text-orange-700',
  EXPORT: 'bg-purple-100 text-purple-700',
  ERROR: 'bg-rose-100 text-rose-700',
  AUTH_FAILED: 'bg-yellow-100 text-yellow-700',
  CONSULTA_AI: 'bg-indigo-100 text-indigo-700',
}

// Reusable SVG Icons for enterprise feel
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const DatabaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

function formatearFechaHora(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('es-ES', { 
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  })
}

const PIE_COLORS = ['#1565d8', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-[0_10px_40px_rgba(15,23,42,0.08)] border border-slate-100">
        <p className="font-bold text-slate-800 text-[13px] mb-3 border-b border-slate-100 pb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-6 mb-1.5 last:mb-0">
            <span className="text-[12px] font-medium text-slate-500 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}
            </span>
            <span className="text-[13px] font-bold text-slate-700">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function RouteComponent() {
  const { data: metricsData, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['admin-metricas'],
    queryFn: async () => {
      const res = await fetchWithToken<Metricas>('/api/admin/logs/metricas')
      if (!res.success) throw new Error(res.error || 'Error al obtener métricas')
      return res.data!
    },
  })

  const { data: logsData, isLoading: isLoadingLogs } = useQuery({
    queryKey: ['admin-dashboard-logs'],
    queryFn: async () => {
      const res = await fetchWithToken<PaginatedResponse<AuditLogEntry>>('/api/admin/logs?page=1&pageSize=6')
      if (!res.success) throw new Error(res.error || 'Error fetching logs')
      return res.data!
    },
  })

  const isLoading = isLoadingMetrics || isLoadingLogs;

  const headerContent = (
    <div className="flex flex-1 items-center justify-between w-full">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Admin Control Center</h1>
        <p className="text-xs text-slate-500 mt-0.5">Métricas de salud del sistema en tiempo real.</p>
      </div>
    </div>
  );

  return (
    <MainPanel headerContent={headerContent}>
      <section className="h-full px-8 py-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="animate-pulse flex flex-col items-center">
                 <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                 <p className="text-sm font-medium text-slate-500">Cargando datos del dashboard...</p>
              </div>
            </div>
          ) : metricsData ? (
            <div className="space-y-6">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1 */}
                <div className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] overflow-hidden hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ActivityIcon />
                  </div>
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-2">Total Consultas</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tight">{metricsData.totalConsultas.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <ActivityIcon />
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] overflow-hidden hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <DatabaseIcon />
                  </div>
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-2">Tokens Consumidos</p>
                      <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">{metricsData.tokensConsumidos.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <DatabaseIcon />
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] overflow-hidden hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <UsersIcon />
                  </div>
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-2">Usuarios Activos</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tight">{metricsData.usuariosActivos}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <UsersIcon />
                    </div>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] overflow-hidden hover:shadow-md transition-shadow">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldIcon />
                  </div>
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-2">Salud del Sistema</p>
                      <p className={`text-3xl font-black tracking-tight flex items-baseline gap-1.5 ${metricsData.tasaErrores > 5 ? 'text-rose-600' : 'text-emerald-500'}`}>
                        {metricsData.tasaErrores}% 
                        <span className="text-[13px] font-semibold text-slate-400 tracking-normal">Fallos</span>
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metricsData.tasaErrores > 5 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-500'}`}>
                      <ShieldIcon />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Line Chart */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex flex-col">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-[15px] font-bold text-slate-800">Evolución de Consultas IA</h2>
                      <p className="text-[13px] text-slate-500 mt-1">Uso diario del modelo y consumo de tokens (Últimos 7 días).</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1565d8]"></span>
                        <span className="text-[12px] font-medium text-slate-500">Consultas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span>
                        <span className="text-[12px] font-medium text-slate-500">Tokens</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metricsData.actividadPorDia} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorConsultas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1565d8" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#1565d8" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} dy={10} tickFormatter={(val) => {
                          const [_,m,d] = val.split('-');
                          return `${d}/${m}`;
                        }} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area yAxisId="left" type="monotone" dataKey="consultas" name="Consultas IA" stroke="#1565d8" strokeWidth={3} fillOpacity={1} fill="url(#colorConsultas)" activeDot={{ r: 6, strokeWidth: 0, fill: '#1565d8' }} />
                        <Area yAxisId="right" type="monotone" dataKey="tokens" name="Tokens" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex flex-col">
                  <div className="mb-2">
                    <h2 className="text-[15px] font-bold text-slate-800">Distribución de Logs</h2>
                    <p className="text-[13px] text-slate-500 mt-1">Acciones registradas históricamente.</p>
                  </div>
                  <div className="flex-1 min-h-[260px] w-full flex items-center justify-center relative">
                    {metricsData.distribucionAcciones.length === 0 ? (
                       <p className="text-[13px] text-slate-400">No hay datos suficientes</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={metricsData.distribucionAcciones.slice(0, 5)}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={3}
                            dataKey="cantidad"
                            nameKey="accion"
                            stroke="none"
                          >
                            {metricsData.distribucionAcciones.slice(0, 5).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} 
                            itemStyle={{ color: '#0f172a', fontSize: '13px', fontWeight: 600 }}
                            formatter={(value: any) => [`${value} logs`, '']}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            iconType="circle" 
                            iconSize={8}
                            formatter={(value) => <span className="text-[11px] text-slate-600 font-semibold uppercase tracking-wider">{ACTION_LABELS[value] || value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </div>

              {/* Recent Activity Table */}
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)] flex flex-col overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                  <h2 className="text-[15px] font-bold text-slate-800">Actividad Reciente del Sistema</h2>
                  <Link to="/admin/Logs" className="text-[13px] font-semibold text-[#1565d8] hover:text-blue-800 transition-colors flex items-center gap-1.5">
                    Ver auditoría completa <i className="fa-solid fa-arrow-right text-[11px]"></i>
                  </Link>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/50">
                      <tr>
                        {['Acción', 'Usuario', 'Entidad', 'Detalle', 'Fecha'].map(h => (
                          <th key={h} className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(!logsData || logsData.data.length === 0) ? (
                         <tr>
                           <td colSpan={5} className="px-6 py-10 text-center text-[13px] text-slate-400">
                             No hay actividad registrada.
                           </td>
                         </tr>
                      ) : (
                        logsData.data.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide ${ACTION_COLORS[log.accion] ?? 'bg-slate-100 text-slate-500'}`}>
                                {ACTION_LABELS[log.accion] ?? log.accion}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-[13px] font-semibold text-slate-800">
                                  {log.user?.nombre || (log.accion === 'AUTH_FAILED' ? 'Usuario No Identificado' : 'Sistema')}
                                </span>
                                <span className="text-[11px] text-slate-400">{log.user?.email || ''}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[13px] text-slate-500 font-medium">
                              {log.entidad}{log.entidadId ? ` #${log.entidadId}` : ''}
                            </td>
                            <td className="px-6 py-4 text-[13px] text-slate-500 max-w-[300px] truncate">
                              {log.detalle}
                            </td>
                            <td className="px-6 py-4 text-[12px] text-slate-400 whitespace-nowrap">
                              {formatearFechaHora(log.createdAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </section>
    </MainPanel>
  )
}