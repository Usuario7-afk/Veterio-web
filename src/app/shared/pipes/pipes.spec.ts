import { EdadMascota } from './edad-mascota';
import { EtiquetaEstado } from './etiqueta-estado';
import { EtiquetaRol, EtiquetaServicio, NombreEspecie } from './etiquetas';
import { FechaHora } from './fecha-hora';
import { Hora12, Soles, Telefono, TiempoRestante } from './formatos';

describe('Pipe fechaHora', () => {
  const pipe = new FechaHora();

  it('da formato corto, largo y de hora', () => {
    expect(pipe.transform('2026-11-03')).toBe('03/11/2026');
    expect(pipe.transform('2026-11-03', 'larga')).toBe('martes 3 de noviembre de 2026');
    expect(pipe.transform('2026-11-03', 'diaMes')).toBe('3 nov.');
    expect(pipe.transform('2026-11-03', 'completa', '09:05')).toBe('03/11/2026 9:05 a. m.');
    expect(pipe.transform('2026-11-03', 'hora', '15:30')).toBe('3:30 p. m.');
    expect(pipe.transform(new Date(2026, 0, 1), 'mesAnio')).toBe('Enero 2026');
  });

  it('devuelve vacío sin valor', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform('')).toBe('');
  });
});

describe('Pipe estadoCita', () => {
  const pipe = new EtiquetaEstado();

  it('devuelve texto y clase de color por estado', () => {
    expect(pipe.transform('pendiente')).toBe('Pendiente');
    expect(pipe.transform('atendida', 'clase')).toBe('badge-estado-atendida');
    expect(pipe.transform('cancelada', 'icono')).toBe('bi-x-lg');
    expect(pipe.transform('otro')).toBe('');
  });
});

describe('Pipe edad', () => {
  const pipe = new EdadMascota();
  const referencia = new Date(2026, 10, 3);

  it('expresa la edad en lenguaje simple', () => {
    expect(pipe.transform('2021-03-12', referencia)).toBe('5 años');
    expect(pipe.transform('2025-09-03', referencia)).toBe('1 año y 2 meses');
    expect(pipe.transform('2026-07-01', referencia)).toBe('4 meses');
    expect(pipe.transform('2026-10-30', referencia)).toBe('Menos de un mes');
    expect(pipe.transform('', referencia)).toBe('Sin dato');
  });
});

describe('Pipes de etiquetas', () => {
  it('traducen códigos internos', () => {
    expect(new NombreEspecie().transform('conejo')).toBe('Conejo');
    expect(new EtiquetaServicio().transform('vacunacion')).toBe('Vacunación');
    expect(new EtiquetaRol().transform('recepcion')).toBe('Recepción');
    expect(new EtiquetaRol().transform('desconocido')).toBe('');
  });
});

describe('Pipes de formato', () => {
  it('teléfono en grupos de tres', () => {
    expect(new Telefono().transform('987654321')).toBe('987 654 321');
    expect(new Telefono().transform('12345')).toBe('12345');
  });

  it('hora en formato de 12 horas', () => {
    const pipe = new Hora12();
    expect(pipe.transform('09:00')).toBe('9:00 a. m.');
    expect(pipe.transform('12:30')).toBe('12:30 p. m.');
    expect(pipe.transform('00:15')).toBe('12:15 a. m.');
    expect(pipe.transform('17:00')).toBe('5:00 p. m.');
    expect(pipe.transform(null)).toBe('');
  });

  it('montos en soles', () => {
    expect(new Soles().transform(85)).toBe('S/ 85.00');
    expect(new Soles().transform(1250.5)).toBe('S/ 1,250.50');
    expect(new Soles().transform(null)).toBe('S/ 0.00');
  });

  it('tiempo restante para una cita', () => {
    const pipe = new TiempoRestante();
    const ahora = new Date(2026, 10, 3, 10, 0);
    expect(pipe.transform('2026-11-03', '10:25', ahora)).toBe('En 25 min');
    expect(pipe.transform('2026-11-03', '12:30', ahora)).toBe('En 2 h 30 min');
    expect(pipe.transform('2026-11-03', '10:00', ahora)).toBe('En curso');
    expect(pipe.transform('2026-11-05', '10:00', ahora)).toBe('En 2 días');
    expect(pipe.transform('2026-11-03', '08:00', ahora)).toBe('Ya pasó');
  });
});
