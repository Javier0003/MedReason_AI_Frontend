import { create } from "zustand";
import type { User, Role } from "../types";
import Cookies from 'js-cookie'

type AuthenticationState = {
  isAuthenticated: boolean;
  authenticationToken: string | null;
  user: User | null;
}

type AuthenticationActions = {
  authenticate: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

type LoginReturnType = {
  message: string
  token: string
  id: number
}

// Forma real que devuelve el backend (campos en español),
// distinta al tipo `User` que usa el resto del frontend.
type UsuarioApiResponse = {
  id: number
  nombre: string
  email: string
  rol: Role
}

const API_BASE_URL = "http://localhost:3006"

export const authenticationStore = create<AuthenticationState & AuthenticationActions>((set) => ({
  isAuthenticated: false,
  authenticationToken: null,
  user: null,
  authenticate: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        email,
        password
      })
    })

    if(!res.ok) {
      return false
    }

    const data = await res.json() as LoginReturnType

    const userRes = await fetch(`${API_BASE_URL}/api/usuarios/${data.id}`, {
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${data.token}`
      },
      method: 'GET'
    })

    if(!userRes.ok) {
      return false
    }

    const userData = (await userRes.json() as {user: UsuarioApiResponse}).user

    const mappedUser: User = {
      id: userData.id,
      name: userData.nombre,
      rol: userData.rol,
      userImg: "https://example.com/user.jpg",
      profession: userData.rol === 'ADMIN' ? 'Administrador' : 'Médico',
      email: userData.email,
      status: 'Activo'
    }

    Cookies.set('authenticationToken', data.token, { expires: 7, path: '/' });
    Cookies.set('userData', JSON.stringify(mappedUser), { expires: 7, path: '/' });
    set({
      isAuthenticated: true,
      authenticationToken: data.token,
      user: mappedUser
    });
    return true;
  },

  logout: async () => {
    // enviar solicitud de logout al backend si es necesario

    Cookies.remove('authenticationToken', { path: '/' });
    Cookies.remove('userData', { path: '/' });
    set({ isAuthenticated: false, authenticationToken: null, user: null })
  }
}))