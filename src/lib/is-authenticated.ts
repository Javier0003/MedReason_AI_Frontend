import { redirect } from '@tanstack/react-router'
import { authenticationStore } from '../store/authentication-store'
import Cookies from 'js-cookie'

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

  if (path === '/auth/login' && user?.rol === 'DOCTOR') {
    throw redirect({ to: '/doctor/dashboard' })
  }

  if (user?.rol === 'ADMIN' && path === '/auth/login') {
    throw redirect({ to: '/admin/Logs' })
  }

  return true
}