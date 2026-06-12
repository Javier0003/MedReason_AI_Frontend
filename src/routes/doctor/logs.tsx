import { createFileRoute } from '@tanstack/react-router'
import MainPanel from '../../components/main-panel.tsx'

export const Route = createFileRoute('/doctor/logs')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <MainPanel sidebarRole="DOCTOR" userName="Dr. Smith" userProfession="Cardiologist">
      <div className="p-5">
        <h2 className="text-xl font-semibold mb-4">Consultation Logs</h2>
        <p className="text-gray-600">Here you can view the logs of your past consultations.</p>
      </div>
    </MainPanel>
  )
}
