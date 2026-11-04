import { DatosPersona, Persona } from './persona';

export interface DatosDueno extends DatosPersona {
  direccion: string;
}

export type NuevoDueno = Omit<DatosDueno, 'id'>;

export class Dueno extends Persona {
  public direccion: string;

  constructor(datos: DatosDueno) {
    super(datos);
    this.direccion = datos.direccion.trim();
  }

  public get tipo(): string {
    return 'Dueño';
  }

  public descripcion(): string {
    return `DNI ${this.documento} · Cel. ${this.telefono}`;
  }

  public toJSON(): DatosDueno {
    return { ...this.datosBase(), direccion: this.direccion };
  }
}
