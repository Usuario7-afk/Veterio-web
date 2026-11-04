import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root', useFactory: () => new MotorLocalStorage() })
export abstract class MotorAlmacenamiento {
  public abstract obtener(clave: string): string | null;
  public abstract guardar(clave: string, valor: string): void;
  public abstract eliminar(clave: string): void;
}

@Injectable()
export class MotorLocalStorage extends MotorAlmacenamiento {
  public obtener(clave: string): string | null {
    try {
      return window.localStorage.getItem(clave);
    } catch {
      return null;
    }
  }

  public guardar(clave: string, valor: string): void {
    try {
      window.localStorage.setItem(clave, valor);
    } catch {
      return;
    }
  }

  public eliminar(clave: string): void {
    try {
      window.localStorage.removeItem(clave);
    } catch {
      return;
    }
  }
}

@Injectable()
export class MotorMemoria extends MotorAlmacenamiento {
  private readonly datos = new Map<string, string>();

  public obtener(clave: string): string | null {
    return this.datos.get(clave) ?? null;
  }

  public guardar(clave: string, valor: string): void {
    this.datos.set(clave, valor);
  }

  public eliminar(clave: string): void {
    this.datos.delete(clave);
  }

  public get cantidad(): number {
    return this.datos.size;
  }
}
