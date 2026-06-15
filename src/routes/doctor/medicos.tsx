import { createFileRoute } from '@tanstack/react-router'
import { Sidebar } from '../../components/sidebar.tsx'
import isAuthenticated from '../../lib/is-authenticated.ts'

export const Route = createFileRoute('/doctor/medicos')({
  component: RouteComponent,
  beforeLoad: isAuthenticated
})

function RouteComponent() {
  return <div>
    
    {/* ── Sidebar ── */}
      <Sidebar role="DOCTOR" />
    
    
    
    
    
      </div>

  
}



      