import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TipoAviso } from '../../shared/modelos/tipos';

export interface Aviso {
  readonly id: number;
  readonly mensaje: string;
  readonly tipo: TipoAviso;
}

@Injectable({ providedIn: 'root' })
export class Notificaciones {
  private contador = 0;
  private readonly sujeto = new BehaviorSubject<readonly Aviso[]>([]);

  public get avisos$(): Observable<readonly Aviso[]> {
    return this.sujeto.asObservable();
  }

  public get avisos(): readonly Aviso[] {
    return this.sujeto.value;
  }

  public mostrar(mensaje: string, tipo: TipoAviso = 'exito', duracion = 4000): number {
    const aviso: Aviso = { id: ++this.contador, mensaje, tipo };
    this.sujeto.next([...this.sujeto.value, aviso]);
    if (duracion > 0) {
      setTimeout(() => this.cerrar(aviso.id), duracion);
    }
    return aviso.id;
  }

  public exito(mensaje: string): number {
    return this.mostrar(mensaje, 'exito');
  }

  public error(mensaje: string): number {
    return this.mostrar(mensaje, 'error', 6000);
  }

  public cerrar(id: number): void {
    this.sujeto.next(this.sujeto.value.filter((aviso) => aviso.id !== id));
  }
}
