import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { PROVEEDORES_MEMORIA, sinRetardos } from '../testing/proveedores-prueba';
import { Autenticacion } from './auth/servicios/autenticacion';
import { Usuarios } from './auth/servicios/usuarios';
import { Citas } from './citas/servicios/citas';
import { Sesion } from './core/servicios/sesion';
import { Atenciones } from './historial/servicios/atenciones';
import { Duenos } from './mascotas/servicios/duenos';
import { Mascotas } from './mascotas/servicios/mascotas';
import { TipoEspecie } from './shared/modelos/especie';
import { aISO, sumarDias } from './shared/utilidades/fechas';

function proximoDia(diaSemana: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 7);
  while (fecha.getDay() !== diaSemana) {
    fecha.setDate(fecha.getDate() + 1);
  }
  return aISO(fecha);
}

describe('Servicios de dominio', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: PROVEEDORES_MEMORIA }));

  describe('Mascotas y Duenos', () => {
    it('registra un dueño y una mascota', () => {
      const duenos = TestBed.inject(Duenos);
      const mascotas = TestBed.inject(Mascotas);
      const dueno = duenos.registrar({
        nombres: 'Gabriela',
        apellidos: 'Poma Cáceres',
        documento: '76543210',
        telefono: '956781234',
        correo: '',
        direccion: 'Jr. Ica 450, Cercado de Lima',
      });
      const mascota = mascotas.registrar({
        nombre: ' Simba ',
        especie: TipoEspecie.Gato,
        raza: 'Persa',
        sexo: 'macho',
        fechaNacimiento: '2023-01-15',
        peso: 4.1,
        color: 'Naranja',
        alergias: ['Pollo', ' '],
        observaciones: '',
        duenoId: dueno.id,
      });
      expect(mascota.nombre).toBe('Simba');
      expect(mascota.alergias).toEqual(['Pollo']);
      expect(mascotas.obtenerConDueno(mascota.id)?.dueno?.nombreCompleto).toBe('Gabriela Poma Cáceres');
      expect(duenos.buscarPorDocumento('76543210')?.id).toBe(dueno.id);
    });

    it('filtra por texto, dueño, DNI y especie', () => {
      const mascotas = TestBed.inject(Mascotas);
      expect(mascotas.filtrar({ texto: 'rocky', especie: 'todas' }).map((i) => i.mascota.nombre)).toEqual(['Rocky']);
      expect(mascotas.filtrar({ texto: 'huaman', especie: 'todas' }).length).toBe(1);
      expect(mascotas.filtrar({ texto: '72318456', especie: 'todas' }).length).toBe(2);
      expect(mascotas.filtrar({ texto: '', especie: TipoEspecie.Gato }).every((i) => i.mascota.especie === 'gato')).toBe(true);
    });

    it('verifica si un DNI está disponible', async () => {
      const duenos = TestBed.inject(Duenos);
      sinRetardos(duenos);
      expect(await firstValueFrom(duenos.documentoDisponible('45781236'))).toBe(false);
      expect(await firstValueFrom(duenos.documentoDisponible('45781236', 'due-1'))).toBe(true);
      expect(await firstValueFrom(duenos.documentoDisponible('11112222'))).toBe(true);
    });
  });

  describe('Citas', () => {
    it('agenda una cita en un horario libre', () => {
      const citas = TestBed.inject(Citas);
      const fecha = proximoDia(3);
      const resultado = citas.agendar({ mascotaId: 'mas-2', veterinarioId: 'vet-1', fecha, hora: '10:00', motivo: 'control', notas: '' });
      expect(resultado.ok).toBe(true);
      expect(resultado.ok && resultado.valor.estado).toBe('pendiente');
      expect(citas.horarioOcupado({ fecha, hora: '10:00', veterinarioId: 'vet-1' })).toBe(true);
    });

    it('rechaza choques de horario, fechas pasadas y días sin atención', () => {
      const citas = TestBed.inject(Citas);
      const fecha = proximoDia(3);
      const datos = { mascotaId: 'mas-2', veterinarioId: 'vet-1', fecha, hora: '10:00', motivo: 'control' as const, notas: '' };
      citas.agendar(datos);
      expect(citas.agendar(datos)).toEqual({ ok: false, error: 'Ese horario ya está ocupado.' });
      expect(citas.agendar({ ...datos, fecha: sumarDias(aISO(new Date()), -1) }).ok).toBe(false);
      const domingo = citas.agendar({ ...datos, fecha: proximoDia(0) });
      expect(domingo.ok).toBe(false);
    });

    it('lista horarios del día marcando los ocupados', () => {
      const citas = TestBed.inject(Citas);
      const fecha = proximoDia(2);
      citas.agendar({ mascotaId: 'mas-1', veterinarioId: 'vet-2', fecha, hora: '09:30', motivo: 'consulta', notas: '' });
      const horarios = citas.horariosDelDia(fecha, 'vet-2');
      expect(horarios.length).toBe(16);
      expect(horarios.find((h) => h.hora === '09:30')?.libre).toBe(false);
      expect(horarios.find((h) => h.hora === '13:00')).toBeUndefined();
      expect(citas.horariosDelDia(proximoDia(0), 'vet-2')).toEqual([]);
    });

    it('controla las transiciones de estado', () => {
      const citas = TestBed.inject(Citas);
      const resultado = citas.agendar({ mascotaId: 'mas-3', veterinarioId: 'vet-1', fecha: proximoDia(4), hora: '15:00', motivo: 'vacunacion', notas: '' });
      const id = resultado.ok ? resultado.valor.id : '';
      expect(citas.cambiarEstado(id, 'confirmada').ok).toBe(true);
      expect(citas.cambiarEstado(id, 'cancelada').ok).toBe(true);
      expect(citas.cambiarEstado(id, 'confirmada').ok).toBe(false);
      expect(citas.horarioOcupado({ fecha: proximoDia(4), hora: '15:00', veterinarioId: 'vet-1' })).toBe(false);
    });

    it('detalla citas con mascota, dueño y veterinario', () => {
      const citas = TestBed.inject(Citas);
      const hoy = aISO(new Date());
      const delDia = citas.delDia(hoy);
      expect(delDia.length).toBeGreaterThan(0);
      expect(delDia[0].mascota).toBeDefined();
      expect(delDia[0].veterinario?.tipo).toBe('Veterinario');
      expect(delDia.map((c) => c.hora)).toEqual([...delDia.map((c) => c.hora)].sort());
      expect(citas.conteoPorDia()[hoy]).toBeGreaterThan(0);
    });
  });

  describe('Atenciones', () => {
    it('registra una atención, marca la cita como atendida y actualiza el peso', () => {
      const citas = TestBed.inject(Citas);
      const atenciones = TestBed.inject(Atenciones);
      const mascotas = TestBed.inject(Mascotas);
      const cita = citas.lista.find((c) => c.estado === 'pendiente' || c.estado === 'confirmada');
      expect(cita).toBeDefined();
      if (!cita) {
        return;
      }
      const resultado = atenciones.registrar({
        mascotaId: cita.mascotaId,
        veterinarioId: cita.veterinarioId,
        citaId: cita.id,
        fecha: aISO(new Date()),
        tipo: cita.motivo,
        motivo: 'Control general',
        diagnostico: 'Paciente estable.',
        tratamiento: 'Sin tratamiento.',
        medicamentos: [{ nombre: '', dosis: '', frecuencia: '', dias: 1 }],
        peso: 12.75,
        temperatura: 38.5,
        costo: 50,
        proximoControl: null,
      });
      expect(resultado.ok).toBe(true);
      expect(resultado.ok && resultado.valor.medicamentos).toEqual([]);
      expect(citas.obtener(cita.id)?.estado).toBe('atendida');
      expect(mascotas.obtener(cita.mascotaId)?.peso).toBe(12.75);
      expect(atenciones.porMascota(cita.mascotaId)[0].nombreVeterinario).not.toBe('Sin registro');
    });

    it('ordena el historial del más reciente al más antiguo', () => {
      const fechas = TestBed.inject(Atenciones).porMascota('mas-1').map((a) => a.fecha);
      expect(fechas).toEqual([...fechas].sort().reverse());
    });
  });

  describe('Usuarios y Autenticacion', () => {
    it('crea usuarios con correo único y contraseña mínima', () => {
      const usuarios = TestBed.inject(Usuarios);
      const base = { nombre: 'Diego Ramos', correo: 'DRamos@veterio.pe', clave: 'Ramos2026', rol: 'recepcion' as const, activo: true, veterinarioId: 'vet-1' };
      const creado = usuarios.crear(base);
      expect(creado.ok && creado.valor.correo).toBe('dramos@veterio.pe');
      expect(creado.ok && creado.valor.veterinarioId).toBeNull();
      expect(usuarios.crear(base).ok).toBe(false);
      expect(usuarios.crear({ ...base, correo: 'otro@veterio.pe', clave: '123' }).ok).toBe(false);
    });

    it('mantiene la contraseña si se edita sin cambiarla', () => {
      const usuarios = TestBed.inject(Usuarios);
      const resultado = usuarios.actualizar('usr-2', { nombre: 'Rosa Quispe', clave: '' });
      expect(resultado.ok && resultado.valor.clave).toBe('Recepcion2026');
      expect(usuarios.actualizar('usr-2', { correo: 'admin@veterio.pe' }).ok).toBe(false);
    });

    it('verifica el correo de forma asíncrona', async () => {
      const usuarios = TestBed.inject(Usuarios);
      sinRetardos(usuarios);
      expect(await firstValueFrom(usuarios.correoDisponible('admin@veterio.pe'))).toBe(false);
      expect(await firstValueFrom(usuarios.correoDisponible('admin@veterio.pe', 'usr-1'))).toBe(true);
    });

    it('inicia sesión solo con credenciales correctas y cuenta activa', () => {
      const autenticacion = TestBed.inject(Autenticacion);
      const sesion = TestBed.inject(Sesion);
      expect(autenticacion.iniciarSesion({ correo: 'admin@veterio.pe', clave: 'mala' }).ok).toBe(false);
      expect(autenticacion.iniciarSesion({ correo: 'dparedes@veterio.pe', clave: 'Paredes2026' })).toEqual({
        ok: false,
        error: 'Tu cuenta está desactivada. Consulta con el administrador.',
      });
      const resultado = autenticacion.iniciarSesion({ correo: 'ADMIN@veterio.pe', clave: 'Admin2026' });
      expect(resultado.ok).toBe(true);
      expect(sesion.rol).toBe('administrador');
      autenticacion.cerrarSesion();
      expect(sesion.autenticado).toBe(false);
    });
  });
});
