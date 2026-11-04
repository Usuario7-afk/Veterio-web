import { Injectable } from '@angular/core';
import { Guarda } from '../../shared/modelos/guardas';
import { MotorAlmacenamiento } from './motor-almacenamiento';

@Injectable({ providedIn: 'root' })
export class Almacenamiento {
  private readonly prefijo = 'veterio.';

  constructor(private motor: MotorAlmacenamiento) {}

  public leer<T>(clave: string, guarda: Guarda<T>): T | null {
    const crudo = this.motor.obtener(this.prefijo + clave);
    if (crudo === null) {
      return null;
    }
    try {
      const valor: unknown = JSON.parse(crudo);
      return guarda(valor) ? valor : null;
    } catch {
      return null;
    }
  }

  public escribir<T>(clave: string, valor: T): void {
    this.motor.guardar(this.prefijo + clave, JSON.stringify(valor));
  }

  public eliminar(clave: string): void {
    this.motor.eliminar(this.prefijo + clave);
  }

  public existe(clave: string): boolean {
    return this.motor.obtener(this.prefijo + clave) !== null;
  }
}
