import { Pipe, PipeTransform } from '@angular/core';
import { esEstadoCita } from '../modelos/guardas';
import { EstadoCita } from '../modelos/tipos';

export type ModoEstado = 'texto' | 'clase' | 'icono';

interface PresentacionEstado {
  texto: string;
  clase: string;
  icono: string;
}

export const PRESENTACION_ESTADOS: Readonly<Record<EstadoCita, PresentacionEstado>> = {
  pendiente: { texto: 'Pendiente', clase: 'badge-estado-pendiente', icono: 'bi-hourglass-split' },
  confirmada: { texto: 'Confirmada', clase: 'badge-estado-confirmada', icono: 'bi-check2' },
  atendida: { texto: 'Atendida', clase: 'badge-estado-atendida', icono: 'bi-check2-all' },
  cancelada: { texto: 'Cancelada', clase: 'badge-estado-cancelada', icono: 'bi-x-lg' },
};

@Pipe({
  name: 'estadoCita',
  standalone: false,
})
export class EtiquetaEstado implements PipeTransform {
  public transform(estado: EstadoCita | string | null | undefined, modo: ModoEstado = 'texto'): string {
    if (!esEstadoCita(estado)) {
      return '';
    }
    return PRESENTACION_ESTADOS[estado][modo];
  }
}
