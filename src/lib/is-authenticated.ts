import { redirect } from '@tanstack/react-router'
import { authenticationStore } from "../store/authentication-store"

export default async function isAuthenticated() {
  const { isAuthenticated: authenticated } = authenticationStore.getState()

  if (authenticated) {
    throw redirect({ to: '/doctor/dashboard' })
  } else if (window.location.pathname !== '/auth/login') {
    throw redirect({ to: '/auth/login' })
  }
}