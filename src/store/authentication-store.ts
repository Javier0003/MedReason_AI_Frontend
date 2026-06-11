import { create } from "zustand";

type AuthenticationState = {
  isAuthenticated: boolean;
  authenticationToken: string | null;
  authenticate: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const authenticationStore = create<AuthenticationState>((set) => ({
  isAuthenticated: false,
  authenticationToken: null,

  authenticate: async (email: string, password: string) => {
    // Aquí iría la lógica para enviar la solicitud de autenticación al backend

    set({ isAuthenticated: true, authenticationToken: "token" })
    return true;
  },

  logout: async () => {
    // enviar solicitud de logout al backend si es necesario

    set({ isAuthenticated: false, authenticationToken: null })
  }
}))