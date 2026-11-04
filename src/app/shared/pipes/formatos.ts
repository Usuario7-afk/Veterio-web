import { Pipe, PipeTransform } from '@angular/core';
import { aHora12, combinarFechaHora, minutosEntre } from '../utilidades/fechas';

@Pipe({
  name: 'telefono',
  standalone: false,
})
export class Telefono implements PipeTransform {
  public transform(numero: string | null | undefined): string {
    const limpio = (numero ?? '').replace(/\D/g, '');
    if (limpio.length !== 9) {
      return numero ?? '';
    }
    return `${limpio.slice(0, 3)} ${limpio.slice(3, 6)} ${limpio.slice(6)}`;
  }
}

@Pipe({
  name: 'hora12',
  standalone: false,
})
export class Hora12 implements PipeTransform {
  public transform(hora: string | null | undefined): string {
    return hora ? aHora12(hora) : '';
  }
}

@Pipe({
  name: 'soles',
  standalone: false,
})
export class Soles implements PipeTransform {
  public transform(monto: number | null | undefined): string {
    if (monto === null || monto === undefined || Number.isNaN(monto)) {
      return 'S/ 0.00';
    }
    const [entero, decimales] = monto.toFixed(2).split('.');
    const conMiles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `S/ ${conMiles}.${decimales}`;
  }
}

@Pipe({
  name: 'tiempoRestante',
  standalone: false,
})
export class TiempoRestante implements PipeTransform {
  public transform(fecha: string, hora: string, ahora: Date = new Date()): string {
    const minutos = minutosEntre(ahora, combinarFechaHora(fecha, hora));
    if (minutos < -30) {
      return 'Ya pasó';
    }
    if (minutos <= 0) {
      return 'En curso';
    }
    if (minutos < 60) {
      return `En ${minutos} min`;
    }
    const horas = Math.floor(minutos / 60);
    if (horas < 24) {
      return `En ${horas} h ${minutos % 60 > 0 ? `${minutos % 60} min` : ''}`.trim();
    }
    const dias = Math.round(horas / 24);
    return dias === 1 ? 'Mañana' : `En ${dias} días`;
  }
}
