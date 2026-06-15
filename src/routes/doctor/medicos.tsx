import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/doctor/medicos')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(doctor)/medicos"!</div>
}
