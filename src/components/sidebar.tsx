import { Link } from '@tanstack/react-router'
import { authenticationStore } from '../store/authentication-store'
import type { Role } from '../types'

// ─── Tipos ─────────────────────────────────────────────────────────────────────
interface NavItem {
  label: string
  href: string
  icon: string
}

// ─── Menús por rol ─────────────────────────────────────────────────────────────
const DOCTOR_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/doctor/dashboard', icon: '▣' },
  { label: 'Medicos', href: '/doctor/medicos', icon: '👤' },
  { label: 'Consultas', href: '/doctor/consulta', icon: '📋' },
  { label: 'Historial', href: '/doctor/historial', icon: '📊' },
  { label: 'Settings', href: '/doctor/configuracion', icon: '⚙️' },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '▣' },
  { label: 'Users', href: '/admin/medicos', icon: '👥' },
  { label: 'Logs', href: '/admin/Logs', icon: '📝' },
  { label: 'Settings', href: '/admin/configuracion', icon: '⚙️' },
]

const navBasedOnRole: Record<Role, NavItem[]> = {
  "ADMIN": ADMIN_NAV,
  "DOCTOR": DOCTOR_NAV
}

// ─── Componente ────────────────────────────────────────────────────────────────
export function Sidebar() {
  const user = authenticationStore((state) => state.user)
  const changeRole = authenticationStore((state) => state.changeRole)
  const logout = authenticationStore((state) => state.logout)

  const pathname = window.location.pathname

  return (
    <aside className="w-50 h-screen bg-[#0f1729] flex flex-col shrink-0 fixed left-0 top-0 z-30">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#1565d8] rounded-lg flex items-center justify-center text-white text-sm">+</div>
          <div>
            <p className="text-white text-[13px] font-bold leading-none">MedReason AI</p>
            <p className="text-white/40 text-[10px] mt-0.5">Clinical Systems</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navBasedOnRole[user?.role ?? "DOCTOR"].map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors
                ${isActive
                  ? 'bg-[#1565d8] text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/8'
                }`}
            >
              <span className="text-[15px] w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/8 transition-colors"
          onClick={changeRole}>
          toggleRole
        </button>

        <Link to="/support" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/8 transition-colors">
          <span className="text-[15px] w-5 text-center">💬</span>
          Support
        </Link>
        <Link
          to="/auth/login"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/8 transition-colors"
          onClick={async () => await logout()}
        >
          <span className="text-[15px] w-5 text-center">🚪</span>
          Sign Out
        </Link>
      </div>
    </aside>
  )
}