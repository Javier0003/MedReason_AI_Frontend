import { createFileRoute } from '@tanstack/react-router'
import isAuthenticated from '../../../lib/is-authenticated'
import MainPanel from '../../../components/main-panel'

export const Route = createFileRoute('/admin/configuracion/')({
  component: RouteComponent,
  beforeLoad: isAuthenticated
})

function RouteComponent() {

  return (
    <MainPanel>
      <section className="h-full overflow-y-auto px-6 py-6">
        configuracion
      </section>
    </MainPanel>
  )
}