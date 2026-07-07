import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import MainPanel from '../../../components/main-panel'
import isAuthenticated from '../../../lib/is-authenticated'
import type { Role, User, UserStatus } from '../../../types'
 
export const Route = createFileRoute('/admin/dashboard/')({
  component: RouteComponent,
  beforeLoad: isAuthenticated,
})
 

 

function RouteComponent() {
  return (
    <MainPanel>
      <section className="h-full overflow-y-auto px-6 py-6">
        dashboard
      </section>
    </MainPanel>
  )
}