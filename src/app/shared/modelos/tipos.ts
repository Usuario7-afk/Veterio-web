export interface Entidad {
  readonly id: string;
}

export const ROLES = {
  administrador: 'administrador',
  recepcion: 'recepcion',
  veterinario: 'veterinario',
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];

export const ETIQUETAS_ROL: Readonly<Record<Rol, string>> = {
  administrador: 'Administrador',
  recepcion: 'Recepción',
  veterinario: 'Veterinario',
};

export const ESTADOS_CITA = ['pendiente', 'confirmada', 'atendida', 'cancelada'] as const;

export type EstadoCita = (typeof ESTADOS_CITA)[number];

export const TIPOS_SERVICIO = [
  'consulta',
  'vacunacion',
  'control',
  'desparasitacion',
  'cirugia',
  'emergencia',
] as const;

export type TipoServicio = (typeof TIPOS_SERVICIO)[number];

export const ETIQUETAS_SERVICIO: Readonly<Record<TipoServicio, string>> = {
  consulta: 'Consulta',
  vacunacion: 'Vacunación',
  control: 'Control',
  desparasitacion: 'Desparasitación',
  cirugia: 'Cirugía',
  emergencia: 'Emergencia',
};

export type Sexo = 'macho' | 'hembra';

export type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string };

export function exito<T>(valor: T): Resultado<T> {
  return { ok: true, valor };
}

export function fallo<T>(error: string): Resultado<T> {
  return { ok: false, error };
}

export type TipoAviso = 'exito' | 'error' | 'info';
