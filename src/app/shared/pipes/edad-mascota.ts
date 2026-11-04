import { Pipe, PipeTransform } from '@angular/core';
import { calcularEdad, esFechaISO } from '../utilidades/fechas';

const plural = (cantidad: number, singular: string, varios: string): string =>
  `${cantidad} ${cantidad === 1 ? singular : varios}`;

@Pipe({
  name: 'edad',
  standalone: false,
})
export class EdadMascota implements PipeTransform {
  public transform(fechaNacimiento: string | null | undefined, referencia: Date = new Date()): string {
    if (!fechaNacimiento || !esFechaISO(fechaNacimiento)) {
      return 'Sin dato';
    }
    const { anios, meses } = calcularEdad(fechaNacimiento, referencia);
    if (anios === 0 && meses === 0) {
      return 'Menos de un mes';
    }
    if (anios === 0) {
      return plural(meses, 'mes', 'meses');
    }
    if (meses === 0 || anios >= 3) {
      return plural(anios, 'año', 'años');
    }
    return `${plural(anios, 'año', 'años')} y ${plural(meses, 'mes', 'meses')}`;
  }
}
