import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type VarianteConfirmacion = 'primary' | 'danger';

export interface OpcionesConfirmacion {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  variante?: VarianteConfirmacion;
}

export type SolicitudConfirmacion = Required<OpcionesConfirmacion>;

@Injectable({ providedIn: 'root' })
export class Confirmacion {
  private readonly sujeto = new BehaviorSubject<SolicitudConfirmacion | null>(null);
  private resolver: ((aceptado: boolean) => void) | null = null;

  public get solicitud$(): Observable<SolicitudConfirmacion | null> {
    return this.sujeto.asObservable();
  }

  public get abierta(): boolean {
    return this.sujeto.value !== null;
  }

  public preguntar(opciones: OpcionesConfirmacion): Promise<boolean> {
    this.responder(false);
    this.sujeto.next({
      textoConfirmar: 'Confirmar',
      textoCancelar: 'Cancelar',
      variante: 'primary',
      ...opciones,
    });
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  public responder(aceptado: boolean): void {
    const resolver = this.resolver;
    this.resolver = null;
    this.sujeto.next(null);
    if (resolver) {
      resolver(aceptado);
    }
  }
}
