import { Pipe, PipeTransform } from '@angular/core';
import { NOMBRES_DIAS, aHora12, desdeISO, nombreMes } from '../utilidades/fechas';

export type FormatoFecha = 'corta' | 'larga' | 'diaMes' | 'hora' | 'completa' | 'mesAnio';

const dos = (numero: number): string => String(numero).padStart(2, '0');

@Pipe({
  name: 'fechaHora',
  standalone: false,
})
export class FechaHora implements PipeTransform {
  public transform(valor: string | Date | null | undefined, formato: FormatoFecha = 'corta', hora?: string): string {
    if (valor === null || valor === undefined || valor === '') {
      return '';
    }
    const fecha = typeof valor === 'string' ? desdeISO(hora ? `${valor}T${hora}` : valor) : valor;
    if (Number.isNaN(fecha.getTime())) {
      return '';
    }
    const dia = fecha.getDate();
    const mes = nombreMes(fecha.getMonth());
    const anio = fecha.getFullYear();
    const reloj = aHora12(`${fecha.getHours()}:${dos(fecha.getMinutes())}`);
    switch (formato) {
      case 'larga':
        return `${NOMBRES_DIAS[fecha.getDay()]} ${dia} de ${mes} de ${anio}`;
      case 'diaMes':
        return `${dia} ${mes.slice(0, 3)}.`;
      case 'hora':
        return reloj;
      case 'completa':
        return `${dos(dia)}/${dos(fecha.getMonth() + 1)}/${anio} ${reloj}`;
      case 'mesAnio':
        return `${mes.charAt(0).toUpperCase()}${mes.slice(1)} ${anio}`;
      case 'corta':
        return `${dos(dia)}/${dos(fecha.getMonth() + 1)}/${anio}`;
    }
  }
}
