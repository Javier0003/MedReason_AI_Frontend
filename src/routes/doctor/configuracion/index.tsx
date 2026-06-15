import { createFileRoute } from '@tanstack/react-router'
import MainPanel from '../../../components/main-panel.tsx'
import isAuthenticated from '../../../lib/is-authenticated.ts'

export const Route = createFileRoute('/doctor/configuracion/')({
  component: RouteComponent,
    beforeLoad: isAuthenticated
})

function RouteComponent() {
  return (
    <MainPanel>
      <div className="p-4">
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p>Esta es la página de configuración para el médico.</p>
      </div>
    </MainPanel>
  )
}
