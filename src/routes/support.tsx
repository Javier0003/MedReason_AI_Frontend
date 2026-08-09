import { createFileRoute } from '@tanstack/react-router'
import MainPanel from '../components/main-panel'
import isAuthenticated from '../lib/is-authenticated'

export const Route = createFileRoute('/support')({
  component: RouteComponent,
  beforeLoad: isAuthenticated,
})

const sections = [
  { id: 'introduccion', label: 'Introducción', icon: 'fa-solid fa-book-open' },
  { id: 'login', label: 'Iniciar Sesión', icon: 'fa-solid fa-right-to-bracket' },
  { id: 'doctor-dashboard', label: 'Dashboard del Médico', icon: 'fa-solid fa-chart-pie' },
  { id: 'doctor-pacientes', label: 'Gestión de Pacientes', icon: 'fa-solid fa-users' },
  { id: 'doctor-consulta', label: 'Nueva Consulta con IA', icon: 'fa-solid fa-stethoscope' },
  { id: 'doctor-detalle', label: 'Detalle de Consulta', icon: 'fa-solid fa-comments' },
  { id: 'doctor-historial', label: 'Historial de Consultas', icon: 'fa-solid fa-clock-rotate-left' },
  { id: 'admin-dashboard', label: 'Dashboard Admin', icon: 'fa-solid fa-chart-line' },
  { id: 'admin-usuarios', label: 'Gestión de Usuarios', icon: 'fa-solid fa-users-gear' },
  { id: 'admin-config', label: 'Configuración de IA', icon: 'fa-solid fa-sliders' },
  { id: 'admin-logs', label: 'Logs de Auditoría', icon: 'fa-solid fa-rectangle-list' },
]

function RouteComponent() {
  const headerContent = (
    <div className="flex flex-1 items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1565d8] flex items-center justify-center text-[18px]">
          <i className="fa-solid fa-life-ring"></i>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Centro de Ayuda</h1>
          <p className="text-xs text-slate-500 mt-0.5">Guía de uso y documentación técnica de MedReason AI.</p>
        </div>
      </div>
    </div>
  )

  return (
    <MainPanel headerContent={headerContent}>
      <section className="h-full p-8 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-8 items-start">

          {/* Tabla de Contenidos - Sidebar Izquierdo */}
          <aside className="w-full lg:w-[280px] shrink-0 sticky top-8">
            <nav className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 mb-4 px-2">En esta página</h2>
              <ul className="space-y-1">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-slate-600 hover:text-[#1565d8] hover:bg-[#1565d8]/5 rounded-xl transition-colors"
                    >
                      <i className={`${s.icon} text-slate-400 w-4 text-center text-[13px]`}></i>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Contenido Principal */}
          <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)] p-8 md:p-12 mb-16">
            <div className="space-y-12">
              
              {/* Introducción */}
              <Section id="introduccion" title="Introducción">
                <p>
                  MedReason AI es una plataforma clínica impulsada por inteligencia artificial diseñada para ayudar a
                  profesionales de la salud en el diagnóstico y seguimiento de pacientes. La aplicación cuenta con dos
                  roles de usuario:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="rounded-xl border border-blue-200/80 bg-blue-50/60 p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <i className="fa-solid fa-user-doctor"></i>
                      </div>
                      <p className="text-[13px] font-bold uppercase tracking-[0.05em] text-blue-800">Médico</p>
                    </div>
                    <p className="text-[13px] text-blue-900/70 leading-relaxed">
                      Gestiona pacientes, realiza consultas con IA, revisa historiales y accede al dashboard clínico.
                    </p>
                  </div>
                  <div className="rounded-xl border border-purple-200/80 bg-purple-50/60 p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                        <i className="fa-solid fa-user-gear"></i>
                      </div>
                      <p className="text-[13px] font-bold uppercase tracking-[0.05em] text-purple-800">Administrador</p>
                    </div>
                    <p className="text-[13px] text-purple-900/70 leading-relaxed">
                      Administra usuarios del sistema, configura el modelo de IA, revisa logs de auditoría y monitorea métricas.
                    </p>
                  </div>
                </div>
              </Section>

              {/* Login */}
              <Section id="login" title="Iniciar Sesión">
                <p>
                  La página de inicio de sesión es la puerta de entrada al sistema. Ingresa con tus credenciales clínicas
                  para acceder al panel correspondiente según tu rol.
                </p>
                <Steps
                  steps={[
                    'Ingresa tu correo electrónico institucional en el campo "Correo electrónico".',
                    'Escribe tu contraseña en el campo correspondiente. Puedes usar el ícono del ojo para mostrar u ocultar la contraseña.',
                    'Opcionalmente, marca "Recordar mis datos" para que el correo se guarde en tu navegador.',
                    'Haz clic en "Iniciar Sesión en el Panel Clínico".',
                    'Serás redirigido automáticamente a tu dashboard (Médico o Administrador) según tu rol.',
                  ]}
                />
                <Tip>
                  Si olvidaste tu contraseña, contacta al administrador del sistema para restablecerla.
                </Tip>
              </Section>

              {/* Doctor Dashboard */}
              <Section id="doctor-dashboard" title="Dashboard del Médico">
                <p>
                  El dashboard te da una vista general de tu jornada. Aquí puedes ver tus pacientes del día,
                  consultar tareas pendientes y acceder rápidamente a las funciones principales.
                </p>
                <div className="space-y-4 mt-6">
                  <Feature title="Tarjetas de Métricas">
                    Muestra el total de pacientes y las consultas pendientes para que tengas una visión rápida
                    de tu carga de trabajo.
                  </Feature>
                  <Feature title="Pacientes de Hoy">
                    Tabla con los pacientes programados para el día. Puedes buscar por nombre, tipo u hora.
                    Usa el botón "+ Añadir Paciente" para crear una consulta nueva.
                  </Feature>
                  <Feature title="Calendario y Tareas">
                    El calendario te permite navegar entre días. Al hacer clic en un día, se muestran las
                    tareas programadas. La sección "Tareas Prioritarias" te recuerda tus pendientes más importantes.
                  </Feature>
                </div>
              </Section>

              {/* Doctor Pacientes */}
              <Section id="doctor-pacientes" title="Gestión de Pacientes">
                <p>
                  Administra el registro de pacientes del sistema. Puedes crear, editar y eliminar pacientes,
                  así como buscar rápidamente por nombre o documento.
                </p>
                <div className="space-y-4 mt-6">
                  <Feature title="Crear Paciente">
                    Haz clic en "+ Nuevo Paciente" y completa los campos: nombre completo, edad, sexo y número
                    de documento. El paciente quedará disponible para asociarlo a consultas.
                  </Feature>
                  <Feature title="Editar Paciente">
                    En la tabla de pacientes, haz clic en "Editar" en la fila del paciente que deseas modificar.
                    Puedes actualizar nombre, edad y documento.
                  </Feature>
                  <Feature title="Eliminar Paciente">
                    Usa el botón "Eliminar" en la fila correspondiente. El sistema eliminará al paciente
                    de forma permanente.
                  </Feature>
                  <Feature title="Búsqueda y Paginación">
                    Usa el campo de búsqueda para filtrar pacientes por nombre o documento. La tabla está paginada
                    (10 pacientes por página) con navegación inferior.
                  </Feature>
                </div>
              </Section>

              {/* Doctor Consulta */}
              <Section id="doctor-consulta" title="Nueva Consulta con IA">
                <p>
                  El asistente de IA te ayuda a generar diagnósticos basados en los síntomas y datos clínicos
                  del paciente. El proceso consta de dos pasos.
                </p>
                <Steps
                  steps={[
                    'Haz clic en "+ Nueva Consulta" en la página de Consultas.',
                    'Busca y selecciona un paciente existente usando el campo de búsqueda.',
                    'Describe los síntomas y datos clínicos en el área de texto.',
                    'Haz clic en "Realizar Consulta" para enviar la información al modelo de IA.',
                    'Revisa el diagnóstico generado, el nivel de riesgo, el modelo usado y los tokens consumidos.',
                    'Puedes cerrar el modal o crear una nueva consulta desde el mismo.',
                  ]}
                />
                <Tip>
                  Sé específico al describir los síntomas. Incluye antecedentes relevantes, resultados de
                  exámenes y cualquier dato clínico que pueda ayudar al modelo a generar un diagnóstico preciso.
                </Tip>
              </Section>

              {/* Doctor Detalle */}
              <Section id="doctor-detalle" title="Detalle de Consulta y Chat IA">
                <p>
                  Al hacer clic en una consulta de la lista, accedes a la vista detallada donde puedes revisar
                  y editar la información, así como interactuar con el asistente de IA.
                </p>
                <div className="space-y-4 mt-6">
                  <Feature title="Editar Síntomas y Diagnóstico">
                    Haz clic en "Editar" para modificar los síntomas o el diagnóstico generado por IA.
                    Usa "Guardar" para confirmar los cambios o "Cancelar" para descartarlos.
                  </Feature>
                  <Feature title="Chat con Clinical Insight AI">
                    En el panel lateral derecho puedes hacer preguntas de seguimiento al asistente IA.
                    Escribe tu pregunta y presiona Enter o haz clic en enviar. El asistente responderá
                    mostrando los tokens consumidos en cada respuesta.
                  </Feature>
                  <Feature title="Finalizar Consulta">
                    Una vez que hayas completado el análisis, usa el botón "Complete Consultation"
                    para marcar la consulta como finalizada.
                  </Feature>
                </div>
                <Tip>
                  El chat IA es útil para explorar diagnósticos diferenciales, preguntar sobre
                  interacciones medicamentosas o solicitar recomendaciones de tratamiento adicionales.
                </Tip>
              </Section>

              {/* Doctor Historial */}
              <Section id="doctor-historial" title="Historial de Consultas">
                <p>
                  El historial completo te permite revisar todas las consultas realizadas en el sistema,
                  con filtros avanzados y opción de exportar a Excel.
                </p>
                <div className="space-y-4 mt-6">
                  <Feature title="Filtros">
                    Usa los filtros de fecha ("Desde" / "Hasta") y el campo "ID del paciente" para
                    acotar los resultados y encontrar consultas específicas.
                  </Feature>
                  <Feature title="Exportar a Excel">
                    Haz clic en "Exportar Excel" para descargar un archivo .xlsx con los datos de la
                    página actual del historial.
                  </Feature>
                  <Feature title="Ver Detalle">
                    Haz clic en cualquier fila de la tabla para abrir la vista detallada de esa consulta,
                    donde puedes editar la información y chatear con la IA.
                  </Feature>
                </div>
              </Section>

              {/* Admin Dashboard */}
              <Section id="admin-dashboard" title="Dashboard del Administrador">
                <p>
                  El dashboard de administración te muestra métricas generales del sistema para que
                  puedas monitorear el uso de la plataforma.
                </p>
                <div className="space-y-4 mt-6">
                  <Feature title="Total Consultas">
                    Número total de consultas realizadas en el sistema desde su puesta en marcha.
                  </Feature>
                  <Feature title="Tokens Consumidos">
                    Total de tokens utilizados por el modelo de IA. Útil para monitorear costos operativos.
                  </Feature>
                  <Feature title="Usuarios Activos">
                    Cantidad de usuarios actualmente activos en la plataforma.
                  </Feature>
                </div>
              </Section>

              {/* Admin Usuarios */}
              <Section id="admin-usuarios" title="Gestión de Usuarios">
                <p>
                  Administra los usuarios del sistema. Puedes crear, editar, activar y desactivar
                  cuentas de médicos y administradores.
                </p>
                <div className="space-y-4 mt-6">
                  <Feature title="Crear Usuario">
                    Haz clic en "+ Nuevo Usuario". Completa nombre, email, contraseña y selecciona
                    el rol (Médico o Administrador). Haz clic en "Crear" para guardar.
                  </Feature>
                  <Feature title="Editar Usuario">
                    Haz clic en "Editar" en la fila del usuario. Puedes modificar nombre, email y rol.
                    La contraseña no se muestra por seguridad.
                  </Feature>
                  <Feature title="Activar / Desactivar">
                    Usa el botón de alternancia en la columna de acciones para activar o desactivar
                    un usuario. Los usuarios desactivados no pueden iniciar sesión.
                  </Feature>
                  <Feature title="Ver Detalle">
                    Haz clic en cualquier fila de la tabla para ver la información completa del
                    usuario en un modal de solo lectura.
                  </Feature>
                </div>
              </Section>

              {/* Admin Config */}
              <Section id="admin-config" title="Configuración de IA">
                <p>
                  Configura los parámetros del modelo de inteligencia artificial y gestiona las
                  versiones del prompt del sistema.
                </p>
                <div className="space-y-4 mt-6">
                  <Feature title="Parámetros del Modelo">
                    Selecciona el modelo de IA a utilizar, ajusta el límite de tokens y la temperatura
                    (controla la creatividad de las respuestas). El system prompt define el
                    comportamiento base del asistente.
                  </Feature>
                  <Feature title="Versiones de Prompt">
                    Crea nuevas versiones del prompt del sistema para experimentar con diferentes
                    instrucciones. Puedes activar cualquier versión anterior en cualquier momento.
                    La versión activa es la que se usa en todas las consultas.
                  </Feature>
                </div>
                <Tip>
                  La temperatura controla qué tan "creativas" son las respuestas. Valores cercanos a 0
                  producen respuestas más deterministas; valores más altos (hasta 2) generan respuestas
                  más variadas. Para uso clínico, se recomienda mantener la temperatura baja (0.1 - 0.3).
                </Tip>
              </Section>

              {/* Admin Logs */}
              <Section id="admin-logs" title="Logs de Auditoría">
                <p>
                  El registro de auditoría proporciona trazabilidad completa de todas las acciones
                  realizadas en el sistema. Es útil para fines de seguridad y cumplimiento.
                </p>
                <div className="space-y-4 mt-6">
                  <Feature title="Filtros">
                    Puedes filtrar los logs por usuario, fecha y tipo de acción. Los tipos de acción
                    incluyen: CREAR, LEER, ACTUALIZAR, ELIMINAR, INICIO SESIÓN, CIERRE SESIÓN,
                    EXPORTAR, ERROR, AUTENTICACIÓN FALLIDA y CONSULTA IA.
                  </Feature>
                  <Feature title="Visualización">
                    Cada entrada muestra el usuario que realizó la acción, el tipo de acción
                    (codificado por colores), la entidad afectada, detalles adicionales y la
                    fecha y hora exacta.
                  </Feature>
                </div>
              </Section>

            </div>
            
            {/* Footer */}
            <div className="border-t border-slate-100 mt-16 pt-10 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-400 text-xl border border-slate-100">
                <i className="fa-regular fa-envelope"></i>
              </div>
              <p className="text-[13px] text-slate-500">
                ¿Necesitas más ayuda? Contacta al equipo de soporte técnico en{' '}
                <a href="mailto:support@medreason.ai" className="text-[#1565d8] font-bold hover:underline">
                  support@medreason.ai
                </a>
              </p>
            </div>

          </div>
        </div>
      </section>
    </MainPanel>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-10 pb-12 border-b border-slate-100 last:border-0 last:pb-0">
      <h2 className="text-[20px] font-extrabold text-slate-900 mb-5 tracking-tight">{title}</h2>
      <div className="text-[14px] text-slate-600 leading-relaxed space-y-4">{children}</div>
    </section>
  )
}

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-5 hover:bg-white hover:shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition-all duration-300">
      <p className="text-[14px] font-bold text-slate-800 mb-2 flex items-center gap-2">
        <i className="fa-solid fa-circle-check text-[#1565d8] text-[15px]"></i> {title}
      </p>
      <p className="text-[13px] text-slate-500 leading-relaxed pl-6">{children}</p>
    </div>
  )
}

function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-3 mt-6">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-4 p-3 rounded-xl bg-slate-50/80 border border-slate-100/50">
          <span className="w-6 h-6 rounded-lg bg-white shadow-sm border border-slate-200 text-[#1565d8] text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            {i + 1}
          </span>
          <span className="text-[13px] text-slate-600 leading-relaxed pt-0.5">{step}</span>
        </li>
      ))}
    </ol>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-5 mt-6 flex gap-4">
      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
      </div>
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.05em] text-amber-800 mb-1.5">Consejo</p>
        <p className="text-[13px] text-amber-900/80 leading-relaxed">{children}</p>
      </div>
    </div>
  )
}
