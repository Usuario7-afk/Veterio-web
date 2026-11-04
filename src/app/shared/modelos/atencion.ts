import { Entidad, TipoServicio } from './tipos';

export interface Medicamento {
  nombre: string;
  dosis: string;
  frecuencia: string;
  dias: number;
}

export interface Atencion extends Entidad {
  mascotaId: string;
  veterinarioId: string;
  citaId: string | null;
  fecha: string;
  tipo: TipoServicio;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  medicamentos: Medicamento[];
  peso: number;
  temperatura: number;
  costo: number;
  proximoControl: string | null;
}

export type NuevaAtencion = Omit<Atencion, 'id'>;

export interface AtencionVista extends Atencion {
  nombreVeterinario: string;
}
