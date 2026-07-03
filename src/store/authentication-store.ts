import { create } from "zustand";
import type { User } from "../types";
import Cookies from 'js-cookie'

type AuthenticationState = {
  isAuthenticated: boolean;
  authenticationToken: string | null;
  user: User | null;
}

type AuthenticationActions = {
  authenticate: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  changeRole: () => void
}

type LoginReturnType = {
  message: string
  token: string
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

    Cookies.set('authenticationToken', data.token, { expires: 7, path: '/' });
    set({
      isAuthenticated: true,
      authenticationToken: data.token,
      user: {
        id: "1",
        name: "John Doe",
        role: "ADMIN",
        userImg: "https://example.com/user.jpg",
        profession: "Cardiologist",
        email: "qwbe",
        status: 'Activo'
      }
    });
    return true;
  },

  changeRole: () =>
    set((state) => ({
      user: state.user
        ? {
          ...state.user,
          role: state.user.role === "DOCTOR" ? "ADMIN" : "DOCTOR",
        }
        : null,
    })),

  logout: async () => {
    // enviar solicitud de logout al backend si es necesario

    set({ isAuthenticated: false, authenticationToken: null, user: null })
  }
}))