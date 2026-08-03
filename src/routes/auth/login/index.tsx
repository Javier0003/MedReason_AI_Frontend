import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useRef, useState, useEffect } from 'react';
import IconArrowRight from '../../../assets/svg/IconArrowRight';
import IconEye from '../../../assets/svg/IconEye';
import IconLock from '../../../assets/svg/IconLock';
import IconMail from '../../../assets/svg/IconMail';
import IconMedicalLogo from '../../../assets/svg/IconMedicalLogo';
import { authenticationStore } from '../../../store/authentication-store';
import isAuthenticated from '../../../lib/is-authenticated';
import { showToast, clearAllToasts } from '../../../lib/toast';

export const Route = createFileRoute('/auth/login/')({
  component: RouteComponent,
  beforeLoad: isAuthenticated,
})

const STORAGE_KEY = 'medreason_email'

function loadSavedEmail(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

function saveEmail(email: string) {
  localStorage.setItem(STORAGE_KEY, email)
}

function clearSavedEmail() {
  localStorage.removeItem(STORAGE_KEY)
}

function RouteComponent() {
  const navigate = useNavigate()
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => !!loadSavedEmail())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const email = useRef<HTMLInputElement>(null)
  const password = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const savedEmail = loadSavedEmail()
    if (email.current) email.current.value = savedEmail
  }, [])

  const handleLogin = async () => {
    const emailValue = email.current?.value
    const passwordValue = password.current?.value

    const nextErrors = { email: '', password: '' }
    if (!emailValue) nextErrors.email = 'Por favor, ingrese su correo electrónico.'
    if (!passwordValue) nextErrors.password = 'Por favor, ingrese su contraseña.'

    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setIsSubmitting(true)
    const is_authenticated = await authenticationStore.getState().authenticate(emailValue!, passwordValue!)

    if (is_authenticated) {
      if (rememberMe) {
        saveEmail(emailValue!)
      } else {
        clearSavedEmail()
      }

      if(authenticationStore.getState().user?.rol === 'DOCTOR') {
        showToast('Bienvenido', 'Inicio de sesión exitoso. Redirigiendo al panel...', 'success')
        setTimeout(() => { clearAllToasts(); navigate({ to: '/doctor/dashboard' }); }, 1500)
      } else if(authenticationStore.getState().user?.rol === 'ADMIN') {
        showToast('Bienvenido', 'Inicio de sesión exitoso. Redirigiendo al panel de control...', 'success')
        setTimeout(() => { clearAllToasts(); navigate({ to: '/admin/dashboard' }); }, 1500)
      } else {
        showToast('Atención', 'Rol de usuario no reconocido. Por favor, contacte al soporte.', 'warning')
        setIsSubmitting(false)
      }
    } else {
      showToast('Error de Autenticación', 'Por favor, revise sus credenciales e intente nuevamente.', 'error')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f0f5fd] via-[#f6f8fc] to-[#eef3fc] text-slate-900">
      {/* Fondo decorativo */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 right-1/4 h-[420px] w-[420px] rounded-full bg-[#1565d8]/12 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-[#1565d8]/8 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-56 w-56 rounded-full bg-[#1565d8]/6 blur-3xl" />
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-14">
        <div className="w-full max-w-100">

          {/* Badge circular con anillo, flotando sobre la tarjeta */}
          <div className="relative z-20 mx-auto -mb-9 flex h-18 w-18 items-center justify-center rounded-full bg-white text-[#1565d8] shadow-[0_12px_28px_rgba(21,101,216,0.25)] ring-4 ring-[#1565d8]/10">
            <IconMedicalLogo className="h-8 w-8" />
          </div>

          <section className="rounded-[32px] border border-slate-200/60 bg-white pt-16 pb-9 px-8 shadow-[0_25px_60px_rgba(15,23,42,0.10)] sm:px-10">
            <div className="mb-6 text-center">
              <h1 className="text-[22px] font-bold tracking-[-0.02em] text-[#111827]">
                MedReason AI
              </h1>
              <p className="mt-1.5 text-[13px] text-slate-500">
                Ingresa con tus credenciales clínicas para continuar
              </p>
            </div>

            <svg
              viewBox="0 0 400 32"
              className="mb-6 h-7 w-full text-[#1565d8]/70"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polyline
                points="0,16 20,16 26,12 32,16 40,16 44,18 48,2 52,26 56,16 64,16 74,10 84,16 100,16 140,16 160,16 166,12 172,16 180,16 184,18 188,2 192,26 196,16 204,16 214,10 224,16 240,16 280,16 300,16 306,12 312,16 320,16 324,18 328,2 332,26 336,16 344,16 354,10 364,16 380,16 400,16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <form className="space-y-6" onSubmit={async (e) => { e.preventDefault(); await handleLogin(); }}>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-slate-600" htmlFor="email">
                  Correo electrónico
                </label>
                <div className="flex h-11 items-center gap-3 border-b-2 border-slate-200 px-1 text-slate-400 transition focus-within:border-[#1565d8]">
                  <IconMail />
                  <input
                    aria-label="Correo electrónico"
                    type="email"
                    placeholder="nombre@mediflow.clinical"
                    autoComplete="email"
                    className="w-full bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
                    ref={email}
                  />
                </div>
                <p className="mt-1 text-[12px] text-red-500">
                  {errors.email}
                </p>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-[13px] font-medium text-slate-600" htmlFor="password">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    className="text-[12px] font-semibold text-[#1565d8] hover:text-[#0f56bd]"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                </div>

                <div className="flex h-11 items-center gap-3 border-b-2 border-slate-200 px-1 text-slate-400 transition focus-within:border-[#1565d8]">
                  <IconLock />
                  <input
                    type={showPassword ? "text" : "password"}
                    aria-label="Contraseña"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
                    ref={password}
                  />
                  <button
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <IconEye />
                  </button>
                </div>
                <p className="mt-1 text-[12px] text-red-500">
                  {errors.password}
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#1565d8] focus:ring-[#1565d8]/30"
                />
                <span className="text-[13px] text-slate-600">Recordar mis datos</span>
              </label>

              <button
                type="submit"
                onClick={handleLogin}
                disabled={isSubmitting}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1565d8] text-[14px] font-semibold text-white shadow-[0_10px_20px_rgba(21,101,216,0.25)] transition hover:bg-[#0f56bd] active:scale-[0.99] disabled:opacity-70 disabled:cursor-wait"
              >
                {isSubmitting ? 'Verificando credenciales...' : (
                  <>
                    Iniciar Sesión en el Panel Clínico
                    <IconArrowRight />
                  </>
                )}
              </button>
            </form>
          </section>

          <div className="mt-8 text-center">
            <p className="mx-auto max-w-80 text-[12.5px] leading-5 text-slate-500">
              Sistema Médico Confidencial. El acceso no autorizado está prohibido.
            </p>

            <div className="mt-4 flex items-center justify-center gap-6 text-[12px] text-slate-500">
              <Link to="/" className="hover:text-slate-700">
                Política de Privacidad
              </Link>
              <Link to="/" className="hover:text-slate-700">
                Términos de Servicio
              </Link>
              <Link to='/' className="hover:text-slate-700">
                Soporte
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}