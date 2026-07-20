import { create } from "zustand";
import type { User } from "../types";
import Cookies from 'js-cookie'
import { redirect } from "@tanstack/react-router";

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

export const authenticationStore = create<AuthenticationState & AuthenticationActions>((set) => ({
  isAuthenticated: false,
  authenticationToken: null,
  user: null,
  authenticate: async (email: string, password: string) => {
    const res = await fetch("http://localhost:3000/api/auth/login", {
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

    const userRes = await fetch(`http://localhost:3000/api/usuarios/${data.id}`, {
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${data.token}`
      },
      method: 'GET'
    })

    if(!userRes.ok) {
      return false
    }

    const userData = (await userRes.json() as {user: User}).user

    Cookies.set('authenticationToken', data.token, { expires: 7, path: '/' });
    Cookies.set('userData', JSON.stringify(userData), { expires: 7, path: '/' });
    set({
      isAuthenticated: true,
      authenticationToken: data.token,
      user: {
        id: userData.id,
        nombre: userData.nombre,
        rol: userData.rol,
        userImg: "https://example.com/user.jpg",
        profession: "Cardiologist",
        email: userData.email,
        status: 'Activo'
      }
    });
    return true;
  },

  logout: async () => {
    // enviar solicitud de logout al backend si es necesario

    Cookies.remove('authenticationToken', { path: '/' });
    Cookies.remove('userData', { path: '/' });
    set({ isAuthenticated: false, authenticationToken: null, user: null })
    throw redirect({ to: '/auth/login' });
  }
}))