import { createFileRoute } from '@tanstack/react-router'
import MainPanel from '../../components/main-panel'
import isAuthenticated from '../../lib/is-authenticated'

export const Route = createFileRoute('/admin/configuracion')({
  component: RouteComponent,
    beforeLoad: isAuthenticated
})

function RouteComponent() {
  return (
    <MainPanel>
      <div>Hello "/(admin)/configuracion"!</div>
    </MainPanel>
  )
}
