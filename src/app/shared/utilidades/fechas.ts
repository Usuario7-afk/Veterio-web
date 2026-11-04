export const NOMBRES_MESES: readonly string[] = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export const NOMBRES_DIAS: readonly string[] = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
];

export interface Edad {
  anios: number;
  meses: number;
}

const dosDigitos = (numero: number): string => String(numero).padStart(2, '0');

export function aISO(fecha: Date): string {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

export function hoyISO(referencia: Date = new Date()): string {
  return aISO(referencia);
}

export function desdeISO(valor: string): Date {
  const [fecha, hora = '00:00'] = valor.split('T');
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const [horas, minutos] = hora.split(':').map(Number);
  return new Date(anio, mes - 1, dia, horas || 0, minutos || 0);
}

export function esFechaISO(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }
  return aISO(desdeISO(valor)) === valor;
}

export function sumarDias(iso: string, dias: number): string {
  const fecha = desdeISO(iso);
  fecha.setDate(fecha.getDate() + dias);
  return aISO(fecha);
}

export function combinarFechaHora(fecha: string, hora: string): Date {
  return desdeISO(`${fecha}T${hora}`);
}

export function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

export function minutosAHora(minutos: number): string {
  return `${dosDigitos(Math.floor(minutos / 60))}:${dosDigitos(minutos % 60)}`;
}

export function aHora12(hora: string): string {
  const [h, m] = hora.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) {
    return hora;
  }
  const sufijo = h < 12 ? 'a. m.' : 'p. m.';
  const hora12 = h % 12 === 0 ? 12 : h % 12;
  return `${hora12}:${dosDigitos(m)} ${sufijo}`;
}

export function minutosEntre(desde: Date, hasta: Date): number {
  return Math.round((hasta.getTime() - desde.getTime()) / 60000);
}

export function generarHorarios(
  inicio: string,
  fin: string,
  intervalo: number,
  pausa?: { inicio: string; fin: string },
): string[] {
  const horarios: string[] = [];
  const limite = horaAMinutos(fin);
  for (let actual = horaAMinutos(inicio); actual < limite; actual += intervalo) {
    const enPausa =
      pausa !== undefined &&
      actual >= horaAMinutos(pausa.inicio) &&
      actual < horaAMinutos(pausa.fin);
    if (!enPausa) {
      horarios.push(minutosAHora(actual));
    }
  }
  return horarios;
}

export function calcularEdad(nacimiento: string, referencia: Date = new Date()): Edad {
  const inicio = desdeISO(nacimiento);
  let meses =
    (referencia.getFullYear() - inicio.getFullYear()) * 12 +
    (referencia.getMonth() - inicio.getMonth());
  if (referencia.getDate() < inicio.getDate()) {
    meses -= 1;
  }
  const total = Math.max(meses, 0);
  return { anios: Math.floor(total / 12), meses: total % 12 };
}

export function nombreMes(mes: number): string {
  return NOMBRES_MESES[mes] ?? '';
}
