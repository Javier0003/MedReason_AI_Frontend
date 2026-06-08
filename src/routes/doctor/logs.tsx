import { createFileRoute } from '@tanstack/react-router'
import { Sidebar } from '../../components/sidebar.tsx'

export const Route = createFileRoute('/doctor/logs')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>


     {/* ── Sidebar ── */}
      <Sidebar role="DOCTOR" />


  </div>
}
