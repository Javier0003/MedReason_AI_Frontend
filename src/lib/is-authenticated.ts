import { redirect } from '@tanstack/react-router'
import { authenticationStore } from '../store/authentication-store'
import Cookies from 'js-cookie'
import type { Role, User } from '../types'

const roleRoutePatterns: { prefix: string; roles: Role[] }[] = [
  { prefix: '/doctor', roles: ['DOCTOR'] },
  { prefix: '/admin', roles: ['ADMIN'] },
]

export function canAccessRoute(path: string, user: User | null): boolean {
  if (!user) return false

  for (const { prefix, roles } of roleRoutePatterns) {
    if (path.startsWith(prefix)) {
      return roles.includes(user.rol)
    }
  }

  return true
}

export default async function isAuthenticated() {
  const state = authenticationStore.getState()
  let isAuth = state.isAuthenticated
  let user = state.user

  if (!isAuth) {
    const token = Cookies.get('authenticationToken')
    const userData = Cookies.get('userData')

    if (token && userData) {
      try {
        user = JSON.parse(userData)
        authenticationStore.setState({
          isAuthenticated: true,
          authenticationToken: token,
          user,
        })
        isAuth = true
      } catch {
        Cookies.remove('authenticationToken')
        Cookies.remove('userData')
      }
    }
  }

  const path = window.location.pathname

  if (!isAuth) {
    if (path !== '/auth/login') {
      throw redirect({ to: '/auth/login' })
    }
    return
  }

  if (path === '/auth/login') {
    if (user?.rol === 'DOCTOR') throw redirect({ to: '/doctor/dashboard' })
    if (user?.rol === 'ADMIN') throw redirect({ to: '/admin/dashboard' })
  }

  if (!canAccessRoute(path, user)) {
    if (user?.rol === 'DOCTOR') throw redirect({ to: '/doctor/dashboard' })
    if (user?.rol === 'ADMIN') throw redirect({ to: '/admin/dashboard' })
    throw redirect({ to: '/auth/login' })
  }

  return true
}