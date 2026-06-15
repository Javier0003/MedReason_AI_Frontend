import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/configuracion')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(admin)/configuracion"!</div>
}
