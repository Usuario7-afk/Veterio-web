import { aISO } from './fechas';

export interface DiaCalendario {
  fecha: string;
  numero: number;
  delMes: boolean;
  finDeSemana: boolean;
}

export const ENCABEZADOS_SEMANA: readonly string[] = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export function construirMes(anio: number, mes: number): DiaCalendario[][] {
  const primero = new Date(anio, mes, 1);
  const desplazamiento = (primero.getDay() + 6) % 7;
  const inicio = new Date(anio, mes, 1 - desplazamiento);
  const semanas: DiaCalendario[][] = [];
  for (let semana = 0; semana < 6; semana++) {
    const dias: DiaCalendario[] = [];
    for (let dia = 0; dia < 7; dia++) {
      const fecha = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + semana * 7 + dia);
      dias.push({
        fecha: aISO(fecha),
        numero: fecha.getDate(),
        delMes: fecha.getMonth() === mes,
        finDeSemana: dia >= 5,
      });
    }
    semanas.push(dias);
  }
  return semanas;
}

export function moverMes(anio: number, mes: number, delta: number): { anio: number; mes: number } {
  const fecha = new Date(anio, mes + delta, 1);
  return { anio: fecha.getFullYear(), mes: fecha.getMonth() };
}
