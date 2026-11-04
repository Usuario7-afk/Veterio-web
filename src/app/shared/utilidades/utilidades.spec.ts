import { construirMes, moverMes } from './calendario';
import { agruparPor, contarPor, generarId, normalizarTexto, ordenarPor } from './colecciones';
import {
  aISO,
  calcularEdad,
  combinarFechaHora,
  desdeISO,
  esFechaISO,
  generarHorarios,
  horaAMinutos,
  minutosAHora,
  sumarDias,
} from './fechas';

describe('Utilidades de fechas', () => {
  it('convierte entre Date y texto ISO sin desfase de zona horaria', () => {
    const fecha = desdeISO('2026-11-03');
    expect(fecha.getDate()).toBe(3);
    expect(aISO(fecha)).toBe('2026-11-03');
  });

  it('valida fechas ISO reales', () => {
    expect(esFechaISO('2026-02-28')).toBe(true);
    expect(esFechaISO('2026-02-30')).toBe(false);
    expect(esFechaISO('03/11/2026')).toBe(false);
  });

  it('suma días cruzando meses y años', () => {
    expect(sumarDias('2026-12-30', 3)).toBe('2027-01-02');
    expect(sumarDias('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('combina fecha y hora', () => {
    const fecha = combinarFechaHora('2026-11-03', '10:30');
    expect(fecha.getHours()).toBe(10);
    expect(fecha.getMinutes()).toBe(30);
  });

  it('convierte horas a minutos y de vuelta', () => {
    expect(horaAMinutos('09:30')).toBe(570);
    expect(minutosAHora(570)).toBe('09:30');
  });

  it('genera horarios excluyendo el refrigerio', () => {
    const horarios = generarHorarios('09:00', '15:00', 60, { inicio: '13:00', fin: '14:00' });
    expect(horarios).toEqual(['09:00', '10:00', '11:00', '12:00', '14:00']);
  });

  it('calcula la edad en años y meses', () => {
    expect(calcularEdad('2021-03-12', new Date(2026, 10, 3))).toEqual({ anios: 5, meses: 7 });
    expect(calcularEdad('2026-10-20', new Date(2026, 10, 3))).toEqual({ anios: 0, meses: 0 });
  });
});

describe('Utilidades de calendario', () => {
  it('arma seis semanas que empiezan en lunes', () => {
    const semanas = construirMes(2026, 10);
    expect(semanas.length).toBe(6);
    expect(semanas.every((semana) => semana.length === 7)).toBe(true);
    expect(semanas[0][0].fecha).toBe('2026-10-26');
    expect(semanas[0][6]).toEqual({ fecha: '2026-11-01', numero: 1, delMes: true, finDeSemana: true });
  });

  it('mueve el mes cruzando el año', () => {
    expect(moverMes(2026, 11, 1)).toEqual({ anio: 2027, mes: 0 });
    expect(moverMes(2026, 0, -1)).toEqual({ anio: 2025, mes: 11 });
  });
});

describe('Utilidades de colecciones', () => {
  const lista = [
    { nombre: 'Rocky', especie: 'perro', edad: 5 },
    { nombre: 'Luna', especie: 'gato', edad: 2 },
    { nombre: 'Max', especie: 'perro', edad: 7 },
  ];

  it('agrupa por una clave', () => {
    const grupos = agruparPor(lista, (item) => item.especie);
    expect(grupos['perro']?.length).toBe(2);
    expect(grupos['gato']?.length).toBe(1);
  });

  it('cuenta por clave', () => {
    expect(contarPor(lista, (item) => item.especie)).toEqual({ perro: 2, gato: 1 });
  });

  it('ordena sin modificar la lista original', () => {
    const ordenada = ordenarPor(lista, (item) => item.edad, true);
    expect(ordenada.map((item) => item.nombre)).toEqual(['Max', 'Rocky', 'Luna']);
    expect(lista[0].nombre).toBe('Rocky');
  });

  it('normaliza tildes y mayúsculas', () => {
    expect(normalizarTexto('  Huamán ')).toBe('huaman');
  });

  it('genera identificadores con prefijo y distintos', () => {
    const a = generarId('mas');
    const b = generarId('mas');
    expect(a.startsWith('mas-')).toBe(true);
    expect(a).not.toBe(b);
  });
});
