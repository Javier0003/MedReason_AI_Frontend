import { create } from "zustand";
import type { Role } from "../components/sidebar";

type AuthenticationState = {
  isAuthenticated: boolean;
  authenticationToken: string | null;
  user: User | null;
}

type AuthenticationActions = {
  authenticate: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export type User = {
  id: string;
  name: string;
  role: Role;
  userImg: string;
  profession: string;
}

export const authenticationStore = create<AuthenticationState & AuthenticationActions>((set) => ({
  isAuthenticated: false,
  authenticationToken: null,
  user: null,
  authenticate: async (email: string, password: string) => {
    // Aquí iría la lógica para enviar la solicitud de autenticación al backend

    set({
      isAuthenticated: true,
      authenticationToken: "token",
      user: {
        id: "1",
        name: "John Doe",
        role: "DOCTOR",
        userImg: "https://example.com/user.jpg",
        profession: "Cardiologist"
      }
    });
    return true;
  },

  logout: async () => {
    // enviar solicitud de logout al backend si es necesario

    set({ isAuthenticated: false, authenticationToken: null })
  }
}))