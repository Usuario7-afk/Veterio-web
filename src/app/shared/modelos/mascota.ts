import { Dueno } from './dueno';
import { TipoEspecie } from './especie';
import { Entidad, Sexo } from './tipos';

export interface Mascota extends Entidad {
  nombre: string;
  especie: TipoEspecie;
  raza: string;
  sexo: Sexo;
  fechaNacimiento: string;
  peso: number;
  color: string;
  alergias: string[];
  observaciones: string;
  duenoId: string;
  fechaRegistro: string;
}

export type NuevaMascota = Omit<Mascota, 'id' | 'fechaRegistro'>;

export type CambiosMascota = Partial<NuevaMascota>;

export type ResumenMascota = Pick<Mascota, 'id' | 'nombre' | 'especie' | 'raza'>;

export interface MascotaConDueno {
  mascota: Mascota;
  dueno: Dueno | undefined;
}

export interface FiltroMascotas {
  texto: string;
  especie: TipoEspecie | 'todas';
}
