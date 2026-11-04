import { Dueno } from './dueno';
import { Mascota } from './mascota';
import { Entidad, EstadoCita, TipoServicio } from './tipos';
import { Veterinario } from './veterinario';

export interface Cita extends Entidad {
  mascotaId: string;
  veterinarioId: string;
  fecha: string;
  hora: string;
  motivo: TipoServicio;
  estado: EstadoCita;
  notas: string;
  creadaEn: string;
}

export type NuevaCita = Omit<Cita, 'id' | 'estado' | 'creadaEn'>;

export type ClaveHorario = Pick<Cita, 'fecha' | 'hora' | 'veterinarioId'>;

export type CitaDetallada = Cita & {
  mascota: Mascota | undefined;
  dueno: Dueno | undefined;
  veterinario: Veterinario | undefined;
};

export interface HorarioDia {
  hora: string;
  libre: boolean;
}

export interface CambioEstadoCita {
  id: string;
  estado: EstadoCita;
}

export const HORARIO_CLINICA = {
  inicio: '09:00',
  fin: '18:00',
  intervaloMinutos: 30,
  refrigerio: { inicio: '13:00', fin: '14:00' },
} as const;
