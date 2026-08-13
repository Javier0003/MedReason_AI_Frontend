import { create } from "zustand";
import type { User, Role } from "../types";
import Cookies from 'js-cookie'
import { redirect } from "@tanstack/react-router";

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3007'

type JwtPayload = {
  id: number
  email: string
  nombre: string
  rol: Role
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

type AuthenticationState = {
  isAuthenticated: boolean;
  authenticationToken: string | null;
  user: User | null;
}

type AuthenticateResult = {
  success: boolean;
  message?: string;
};

type AuthenticationActions = {
  authenticate: (email: string, password: string) => Promise<AuthenticateResult>;
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
  authenticate: async (email: string, password: string): Promise<AuthenticateResult> => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
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
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || "Por favor, revise sus credenciales e intente nuevamente."
      };
    }

    const data = await res.json() as LoginReturnType

    const payload = decodeJwt(data.token)

    if(!payload) {
      return { success: false, message: "Token inválido recibido." };
    }

    const user: User = {
      id: payload.id,
      nombre: payload.nombre,
      rol: payload.rol,
      userImg: "https://example.com/user.jpg",
      profession: "Cardiologist",
      email: payload.email,
      status: 'Activo'
    }

    Cookies.set('authenticationToken', data.token, { expires: 7, path: '/' });
    Cookies.set('userData', JSON.stringify(user), { expires: 7, path: '/' });
    set({
      isAuthenticated: true,
      authenticationToken: data.token,
      user,
    });
    return { success: true };
  },

  logout: async () => {
    // enviar solicitud de logout al backend si es necesario

    Cookies.remove('authenticationToken', { path: '/' });
    Cookies.remove('userData', { path: '/' });
    set({ isAuthenticated: false, authenticationToken: null, user: null })
    throw redirect({ to: '/auth/login' });
  }
}))