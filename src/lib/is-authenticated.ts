import { redirect } from '@tanstack/react-router'
import { authenticationStore } from "../store/authentication-store"
import Cookies from 'js-cookie'

export default async function isAuthenticated() {
  const { isAuthenticated: authenticated } = authenticationStore.getState()

  let isAuth = authenticated;

  if(!authenticated) {
    const token = Cookies.get('authenticationToken')
    if(token) {
      authenticationStore.setState({ isAuthenticated: true, authenticationToken: token })
      isAuth = true
    }
  }

  const path = window.location.pathname
  
  if (isAuth) {
    if(path === '/doctor/dashboard') return
    if(path === '/auth/login') {
      throw redirect({to: '/doctor/dashboard'})
    }
    return true;
  } else if (path !== '/auth/login') {
    throw redirect({ to: '/auth/login' })
  } 
}