import { createFileRoute } from '@tanstack/react-router'
import isAuthenticated from '../../../lib/is-authenticated'
import MainPanel from '../../../components/main-panel'

export const Route = createFileRoute('/doctor/medicos/')({
  component: RouteComponent,
  beforeLoad: isAuthenticated
})

function RouteComponent() {
  return (
    <MainPanel>
      <div>
        medicos
      </div>
    </MainPanel>
  )
}



