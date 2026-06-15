import { createFileRoute } from '@tanstack/react-router'
import MainPanel from '../components/main-panel'
import isAuthenticated from '../lib/is-authenticated'

export const Route = createFileRoute('/support')({
  component: RouteComponent,
  beforeLoad: isAuthenticated
})

function RouteComponent() {
  return (
    <MainPanel>
      <div className="p-5">
        <h2 className="text-xl font-bold mb-4">Support</h2>
        <p className="text-gray-700 mb-4">If you have any questions or need assistance, please contact our support team:</p>
      </div>
    </MainPanel>
  )
}
