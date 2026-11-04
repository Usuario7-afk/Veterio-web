import { DatosPersona, Persona } from './persona';

export type Tratamiento = 'Dr.' | 'Dra.';

export interface DatosVeterinario extends DatosPersona {
  tratamiento: Tratamiento;
  colegiatura: string;
  especialidad: string;
  diasAtencion: number[];
}

export class Veterinario extends Persona {
  public readonly tratamiento: Tratamiento;
  public readonly colegiatura: string;
  public readonly especialidad: string;
  private readonly dias: ReadonlySet<number>;

  constructor(datos: DatosVeterinario) {
    super(datos);
    this.tratamiento = datos.tratamiento;
    this.colegiatura = datos.colegiatura;
    this.especialidad = datos.especialidad;
    this.dias = new Set(datos.diasAtencion);
  }

  public get tipo(): string {
    return 'Veterinario';
  }

  public get nombreCorto(): string {
    const primerApellido = this.apellidos.split(' ')[0];
    return `${this.tratamiento} ${primerApellido}`;
  }

  public get diasAtencion(): number[] {
    return [...this.dias].sort((a, b) => a - b);
  }

  public descripcion(): string {
    return `${this.especialidad} · CMVP ${this.colegiatura}`;
  }

  public atiendeEl(fecha: Date): boolean {
    return this.dias.has(fecha.getDay());
  }

  public toJSON(): DatosVeterinario {
    return {
      ...this.datosBase(),
      tratamiento: this.tratamiento,
      colegiatura: this.colegiatura,
      especialidad: this.especialidad,
      diasAtencion: this.diasAtencion,
    };
  }
}
