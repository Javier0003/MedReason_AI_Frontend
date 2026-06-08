import { createFileRoute } from '@tanstack/react-router'
import { Sidebar } from '../../components/sidebar.tsx'

export const Route = createFileRoute('/doctor/configuracion')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex">
       {/* ── Sidebar ── */}
      <Sidebar role="DOCTOR" />
      <div className="p-4">
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p>Esta es la página de configuración para el médico.</p>
      </div>
    </div>
  )
}
