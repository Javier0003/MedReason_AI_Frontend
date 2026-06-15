import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-4 flex flex-col gap-4">
      <Link to="/App" className="text-blue-500 hover:underline border border-blue-500 rounded px-2 py-1">
        app
      </Link>
      <Link to="/auth/login" className="text-blue-500 hover:underline border border-blue-500 rounded px-2 py-1 mw-24">
        login
      </Link>
      <Link to="/admin/configuracion" className="text-blue-500 hover:underline border border-blue-500 rounded px-2 py-1 mw-24">
        admin configuracion
      </Link>
      <Link to="/admin/medicos" className="text-blue-500 hover:underline border border-blue-500 rounded px-2 py-1 mw-24">
        admin medicos
      </Link>
      <Link to="/admin/dashboard" className="text-blue-500 hover:underline border border-blue-500 rounded px-2 py-1 mw-24">
        admin dashboard
      </Link>
      <Link to="/doctor/configuracion" className="text-blue-500 hover:underline border border-blue-500 rounded px-2 py-1 mw-24">
        doctor configuracion
      </Link>
      <Link to="/doctor/dashboard" className="text-blue-500 hover:underline border border-blue-500 rounded px-2 py-1 mw-24">
        doctor dashboard
      </Link>
      <Link to="/doctor/logs" className="text-blue-500 hover:underline border border-blue-500 rounded px-2 py-1 mw-24">
        doctor logs
      </Link>
      <Link to="/doctor/medicos" className="text-blue-500 hover:underline border border-blue-500 rounded px-2 py-1 mw-24">
        doctor medicos
      </Link>
    </div>
  )
}
