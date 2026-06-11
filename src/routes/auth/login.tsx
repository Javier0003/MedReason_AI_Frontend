import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react';
import IconArrowRight from '../../assets/svg/IconArrowRight';
import IconEye from '../../assets/svg/IconEye';
import IconLock from '../../assets/svg/IconLock';
import IconMail from '../../assets/svg/IconMail';
import IconMedicalLogo from '../../assets/svg/IconMedicalLogo';
import { authenticationStore } from '../../store/authentication-store';
import isAuthenticated from '../../lib/is-authenticated';

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
  beforeLoad: isAuthenticated,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  const handleLogin = async () => {
    const emailValue = email.current?.value;
    const passwordValue = password.current?.value;

    const nextErrors = {
      email: "",
      password: "",
    };
    if (!emailValue) nextErrors.email = "Por favor, ingrese su correo electrónico.";
    if (!passwordValue) nextErrors.password = "Por favor, ingrese su contraseña.";

    setErrors(nextErrors);
    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (hasErrors) return;

    const is_authenticated = await authenticationStore.getState().authenticate(emailValue!, passwordValue!);

    if(is_authenticated){
      navigate({ to: '/doctor/dashboard' })
    } else {
      alert("Error de autenticación. Por favor, revise sus credenciales e intente nuevamente.")
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f4f7] text-slate-900">
      <div className="absolute inset-0">
        <div className="absolute inset-y-0 left-1/2 w-[420px] -translate-x-1/2 bg-white/35 blur-2xl" />
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute right-[-80px] top-24 h-[520px] w-[320px] rounded-[40px] border border-white/20 bg-white/10 blur-sm" />
        <div className="absolute right-12 top-32 h-16 w-48 rounded-xl bg-white/12 blur-md" />
        <div className="absolute right-14 top-60 h-[280px] w-[220px] rounded-[28px] border border-white/20 bg-white/10" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white/20 to-transparent" />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-[380px]">
          <div className="mb-7 flex flex-col items-center text-center">
            <div className="mb-2 flex items-center gap-2">
              <div className="text-[#1565d8]">
                <IconMedicalLogo className="h-7 w-7" />
              </div>
              <h1 className="text-[20px] font-bold tracking-[-0.02em] text-[#111827]">
                MedReason AI
              </h1>
            </div>
            <p className="text-[13px] text-slate-500">Portal de Sistemas Clínicos</p>
          </div>

          <section className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.10)] backdrop-blur-sm">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500" htmlFor="email">
                  Correo Clínico
                </label>
                <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-300 bg-[#fbfbfc] px-3 text-slate-500 focus-within:border-[#1565d8] focus-within:ring-2 focus-within:ring-[#1565d8]/10">
                  <IconMail />
                  <input
                    aria-label="Correo electrónico"
                    type="email"
                    placeholder="nombre@mediflow.clinical"
                    className="w-full bg-transparent text-[15px] text-slate-600 outline-none placeholder:text-slate-400"
                    ref={email}
                  />
                </div>

                <p className="text-[13px] text-red-500">
                  {errors.email}
                </p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500" htmlFor="password">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-[#1565d8] hover:text-[#0f56bd]"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                </div>

                <div className="flex h-12 items-center gap-3 rounded-lg border border-slate-300 bg-[#fbfbfc] px-3 text-slate-500 focus-within:border-[#1565d8] focus-within:ring-2 focus-within:ring-[#1565d8]/10">
                  <IconLock />
                  <input
                    type={showPassword ? "text" : "password"}
                    aria-label="Contraseña"
                    placeholder="••••••••"
                    className="w-full bg-transparent text-[15px] text-slate-700 outline-none placeholder:text-slate-400"
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
                <p className="text-[13px] text-red-500">
                  {errors.password}
                </p>

              </div>


              <button
                type="submit"
                onClick={handleLogin}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1565d8] text-[15px] font-semibold text-white shadow-sm transition hover:bg-[#0f56bd] active:scale-[0.99]"
              >
                Iniciar Sesión en el Panel Clínico
                <IconArrowRight />
              </button>
            </div>
          </section>

          <div className="mt-6 text-center">
            <p className="mx-auto max-w-[290px] text-[13px] leading-5 text-slate-600">
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