import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Aviso, Notificaciones } from '../../servicios/notificaciones';
import { TipoAviso } from '../../../shared/modelos/tipos';

const CLASES: Readonly<Record<TipoAviso, string>> = {
  exito: 'text-bg-success',
  error: 'text-bg-danger',
  info: 'text-bg-primary',
};

const ICONOS: Readonly<Record<TipoAviso, string>> = {
  exito: 'bi-check-circle',
  error: 'bi-exclamation-triangle',
  info: 'bi-info-circle',
};

@Component({
  selector: 'app-contenedor-toasts',
  standalone: false,
  templateUrl: './contenedor-toasts.html',
  styleUrls: ['./contenedor-toasts.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContenedorToasts {
  public readonly avisos$: Observable<readonly Aviso[]>;

  constructor(private notificaciones: Notificaciones) {
    this.avisos$ = notificaciones.avisos$;
  }

  public cerrar(aviso: Aviso): void {
    this.notificaciones.cerrar(aviso.id);
  }

  public clase(aviso: Aviso): string {
    return CLASES[aviso.tipo];
  }

  public icono(aviso: Aviso): string {
    return ICONOS[aviso.tipo];
  }

  public seguirPorId(_indice: number, aviso: Aviso): number {
    return aviso.id;
  }
}
