import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/medicos')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(admin)/medicos"!</div>
}
