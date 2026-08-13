import { authenticationStore } from "../store/authentication-store";

class FetchResult<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  status: number | null;
  constructor() {
    this.success = false;
    this.data = null;
    this.error = null;
    this.status = null;
  }
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3007'

import { showToast } from "./toast";

interface FetchOptions extends RequestInit {
  hideToastOnError?: boolean;
}

export default async function fetchWithToken<T>(url: string, options: FetchOptions = {}): Promise<FetchResult<T>> {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
  const {authenticationToken: token, logout} = authenticationStore.getState();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  const result = new FetchResult<T>();

  try {
    const res = await fetch(fullUrl, { ...options, headers });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) {
        if (!document.getElementById('session-expired-modal')) {
          const modal = document.createElement('div');
          modal.id = 'session-expired-modal';
          modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300';
          const msg = json.message || '';
          const lowerMsg = msg.toLowerCase();
          const isDeactivated = lowerMsg.includes('desactivad') || lowerMsg.includes('inactiv') || lowerMsg.includes('bloquead') || lowerMsg.includes('deshabilitad');
          const modalTitle = isDeactivated ? "Cuenta Inactiva / Bloqueada" : "Sesión Finalizada";
          const errorMessage = isDeactivated
            ? (msg || "Su cuenta ha sido desactivada. Por favor, póngase en contacto con el administrador.")
            : (msg || "Tu sesión ha finalizado por inactividad. Serás redirigido al inicio de sesión.");

          modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
              <div class="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                <i class="fa-solid fa-user-slash"></i>
              </div>
              <h2 class="text-xl font-bold text-slate-800 mb-2">${modalTitle}</h2>
              <p class="text-[13px] text-slate-500 mb-6 leading-relaxed">${errorMessage}</p>
              <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div class="bg-rose-500 h-full rounded-full transition-all duration-[3000ms] ease-linear w-full" id="session-progress"></div>
              </div>
            </div>
          `;
          document.body.appendChild(modal);

          setTimeout(() => {
            const bar = document.getElementById('session-progress');
            if (bar) bar.style.width = '0%';
          }, 50);

          setTimeout(async () => {
            try {
              await logout();
            } catch (e) {
              // Ignorar el error de "throw redirect" que lanza el store de Zustand
            }
            window.location.href = '/auth/login';
          }, 3000);
        }

        throw new Error("Token inválido");
      }

      // Global Error Handling (Migration Guide v2.0)
      if (!options.hideToastOnError) {
        if (res.status === 500) {
          showToast('Error del Servidor', json.message || "Ha ocurrido un problema interno en el sistema. Intenta de nuevo más tarde.", 'error');
        } else if (res.status === 400 && Array.isArray(json.errors)) {
          const errorDetails = json.errors.map((e: any) => e.message || e).join('\n');
          showToast('Datos Incorrectos', errorDetails, 'warning');
          json.message = "Errores de validación:\n" + errorDetails; // Mantener la propiedad message para otros componentes
        } else if (res.status === 400 && json.message) {
          showToast('Atención', json.message, 'warning');
        } else if (res.status === 429) {
          showToast('Límite Excedido', json.message || "Has realizado demasiadas peticiones en poco tiempo. Por favor, espera un momento.", 'warning');
        }
      } else {
        if (res.status === 400 && Array.isArray(json.errors)) {
          const errorDetails = json.errors.map((e: any) => e.message || e).join('\n');
          json.message = errorDetails; // Sólo el mensaje para que el form lo muestre limpio
        }
      }

      result.status = res.status;
      result.error = json.message || `HTTP ${res.status}`;
      result.data = null;
      result.success = false;
      return result;
    }
    result.status = res.status;
    result.data = json as T;
    result.success = true;
    return result;
  } catch (error) {
    result.error = (error as Error).message || 'Network error';
    result.success = false;
    return result
  }
}
