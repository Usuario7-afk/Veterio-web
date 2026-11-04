import { Entidad } from './tipos';

export interface DatosPersona extends Entidad {
  nombres: string;
  apellidos: string;
  documento: string;
  telefono: string;
  correo: string;
}

export abstract class Persona implements DatosPersona {
  public readonly id: string;
  public nombres: string;
  public apellidos: string;
  public documento: string;
  public telefono: string;
  public correo: string;

  protected constructor(datos: DatosPersona) {
    this.id = datos.id;
    this.nombres = datos.nombres.trim();
    this.apellidos = datos.apellidos.trim();
    this.documento = datos.documento;
    this.telefono = datos.telefono;
    this.correo = datos.correo.trim().toLowerCase();
  }

  public get nombreCompleto(): string {
    return `${this.nombres} ${this.apellidos}`;
  }

  public get iniciales(): string {
    const primera = this.nombres.charAt(0);
    const segunda = this.apellidos.charAt(0);
    return `${primera}${segunda}`.toUpperCase();
  }

  public abstract get tipo(): string;

  public abstract descripcion(): string;

  public coincideCon(texto: string): boolean {
    const buscado = texto.trim().toLowerCase();
    if (!buscado) {
      return true;
    }
    return (
      this.nombreCompleto.toLowerCase().includes(buscado) || this.documento.includes(buscado)
    );
  }

  protected datosBase(): DatosPersona {
    return {
      id: this.id,
      nombres: this.nombres,
      apellidos: this.apellidos,
      documento: this.documento,
      telefono: this.telefono,
      correo: this.correo,
    };
  }
}
