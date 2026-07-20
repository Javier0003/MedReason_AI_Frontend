import { createFileRoute } from '@tanstack/react-router'
import MainPanel from '../components/main-panel'
import isAuthenticated from '../lib/is-authenticated'

export const Route = createFileRoute('/support')({
  component: RouteComponent,
  beforeLoad: isAuthenticated,
})

const sections = [
  { id: 'introduccion', label: 'Introducción' },
  { id: 'login', label: 'Iniciar Sesión' },
  { id: 'doctor-dashboard', label: 'Dashboard del Médico' },
  { id: 'doctor-pacientes', label: 'Gestión de Pacientes' },
  { id: 'doctor-consulta', label: 'Nueva Consulta con IA' },
  { id: 'doctor-detalle', label: 'Detalle de Consulta y Chat IA' },
  { id: 'doctor-historial', label: 'Historial de Consultas' },
  { id: 'admin-dashboard', label: 'Dashboard del Administrador' },
  { id: 'admin-usuarios', label: 'Gestión de Usuarios' },
  { id: 'admin-config', label: 'Configuración de IA' },
  { id: 'admin-logs', label: 'Logs de Auditoría' },
]

function RouteComponent() {
  return (
    <MainPanel>
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">

          {/* Header */}
          <div>
            <h1 className="text-[28px] font-bold text-slate-900">Centro de Ayuda</h1>
            <p className="text-[14px] text-slate-500 mt-1.5 leading-relaxed">
              Guía completa para usar MedReason AI. Selecciona una sección o desplázate para aprender a usar cada funcionalidad.
            </p>
          </div>

          {/* Tabla de Contenidos */}
          <nav className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_2px_12px_rgba(15,23,42,0.06)] p-5">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-400 mb-3">Tabla de Contenidos</h2>
            <div className="grid grid-cols-2 gap-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-[13px] text-slate-600 hover:text-[#1565d8] py-1.5 px-2 rounded-lg hover:bg-[#1565d8]/5 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Introducción */}
          <Section id="introduccion" title="Introducción">
            <p className="text-[14px] text-slate-600 leading-relaxed">
              MedReason AI es una plataforma clínica impulsada por inteligencia artificial diseñada para ayudar a
              profesionales de la salud en el diagnóstico y seguimiento de pacientes. La aplicación cuenta con dos
              roles de usuario:
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="rounded-xl border border-blue-200/80 bg-blue-50/60 p-4">
                <p className="text-[12px] font-bold uppercase tracking-[0.05em] text-blue-700 mb-1">Médico</p>
                <p className="text-[13px] text-blue-900/70 leading-relaxed">
                  Gestiona pacientes, realiza consultas con IA, revisa historiales y accede al dashboard clínico.
                </p>
              </div>
              <div className="rounded-xl border border-purple-200/80 bg-purple-50/60 p-4">
                <p className="text-[12px] font-bold uppercase tracking-[0.05em] text-purple-700 mb-1">Administrador</p>
                <p className="text-[13px] text-purple-900/70 leading-relaxed">
                  Administra usuarios del sistema, configura el modelo de IA, revisa logs de auditoría y monitorea métricas.
                </p>
              </div>
            </div>
          </Section>

          {/* Login */}
          <Section id="login" title="Iniciar Sesión">
            <p className="text-[14px] text-slate-600 leading-relaxed">
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
            <p className="text-[14px] text-slate-600 leading-relaxed">
              El dashboard te da una vista general de tu jornada. Aquí puedes ver tus pacientes del día,
              consultar tareas pendientes y acceder rápidamente a las funciones principales.
            </p>
            <div className="space-y-4 mt-4">
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
            <p className="text-[14px] text-slate-600 leading-relaxed">
              Administra el registro de pacientes del sistema. Puedes crear, editar y eliminar pacientes,
              así como buscar rápidamente por nombre o documento.
            </p>
            <div className="space-y-4 mt-4">
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
            <p className="text-[14px] text-slate-600 leading-relaxed">
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
            <p className="text-[14px] text-slate-600 leading-relaxed">
              Al hacer clic en una consulta de la lista, accedes a la vista detallada donde puedes revisar
              y editar la información, así como interactuar con el asistente de IA.
            </p>
            <div className="space-y-4 mt-4">
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
            <p className="text-[14px] text-slate-600 leading-relaxed">
              El historial completo te permite revisar todas las consultas realizadas en el sistema,
              con filtros avanzados y opción de exportar a Excel.
            </p>
            <div className="space-y-4 mt-4">
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
            <p className="text-[14px] text-slate-600 leading-relaxed">
              El dashboard de administración te muestra métricas generales del sistema para que
              puedas monitorear el uso de la plataforma.
            </p>
            <div className="space-y-4 mt-4">
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
            <p className="text-[14px] text-slate-600 leading-relaxed">
              Administra los usuarios del sistema. Puedes crear, editar, activar y desactivar
              cuentas de médicos y administradores.
            </p>
            <div className="space-y-4 mt-4">
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
            <p className="text-[14px] text-slate-600 leading-relaxed">
              Configura los parámetros del modelo de inteligencia artificial y gestiona las
              versiones del prompt del sistema.
            </p>
            <div className="space-y-4 mt-4">
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
            <p className="text-[14px] text-slate-600 leading-relaxed">
              El registro de auditoría proporciona trazabilidad completa de todas las acciones
              realizadas en el sistema. Es útil para fines de seguridad y cumplimiento.
            </p>
            <div className="space-y-4 mt-4">
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

          {/* Footer */}
          <div className="border-t border-slate-200 pt-6 pb-4 text-center">
            <p className="text-[13px] text-slate-400">
              ¿Necesitas más ayuda? Contacta al equipo de soporte en{' '}
              <a href="mailto:support@medreason.ai" className="text-[#1565d8] hover:underline">
                support@medreason.ai
              </a>
            </p>
          </div>

        </div>
      </div>
    </MainPanel>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="text-[18px] font-bold text-slate-900 mb-3">{title}</h2>
      <div className="text-[14px] text-slate-600 leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_6px_rgba(15,23,42,0.04)]">
      <p className="text-[13px] font-bold text-slate-800 mb-1">{title}</p>
      <p className="text-[13px] text-slate-500 leading-relaxed">{children}</p>
    </div>
  )
}

function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2 mt-3">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-3 text-[13px] text-slate-600">
          <span className="w-5 h-5 rounded-full bg-[#1565d8] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            {i + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 mt-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-amber-700 mb-1">💡 Consejo</p>
      <p className="text-[13px] text-amber-900/70 leading-relaxed">{children}</p>
    </div>
  )
}
