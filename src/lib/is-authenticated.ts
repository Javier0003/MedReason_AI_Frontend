import { redirect } from '@tanstack/react-router'
import { authenticationStore } from "../store/authentication-store"

export default async function isAuthenticated() {
  const { isAuthenticated: authenticated } = authenticationStore.getState()

  const path = window.location.pathname

  if (authenticated) {
    if(path === '/doctor/dashboard') return
    if(path === '/auth/login') {
      throw redirect({to: '/doctor/dashboard'})
    }
    return true;
  } else if (path !== '/auth/login') {
    throw redirect({ to: '/auth/login' })
  } 
}