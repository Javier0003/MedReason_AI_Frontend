import type { DATE_RANGE, DIAGNOSTIC_TYPE, DIAS, MESES } from "../constants/constants";

export type Role = 'DOCTOR' | 'ADMIN'

export type User = {
  id: string;
  name: string;
  role: Role;
  userImg: string;
  profession: string;
}

export interface Consulta {
  id: string
  fecha: string
  hora: string
  paciente: string
  iniciales: string
  diagnostico: string
  tipoDx: DiagnosticType
  medico: string
  medicoColor: string
  status: Status
}

export type DiagnosticType = typeof DIAGNOSTIC_TYPE[number]
export type Dias = typeof DIAS[number]
export type Meses = typeof MESES[number]
export type RangoFecha = typeof DATE_RANGE[number]

export type Status = 'COMPLETED' | 'PENDING' | 'URGENT'