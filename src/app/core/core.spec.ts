import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { PROVEEDORES_MEMORIA } from '../../testing/proveedores-prueba';
import { esListaDe, esMascota, tieneId } from '../shared/modelos/guardas';
import { Entidad } from '../shared/modelos/tipos';
import { Almacenamiento } from './almacenamiento/almacenamiento';
import { MotorAlmacenamiento, MotorMemoria } from './almacenamiento/motor-almacenamiento';
import { crearDatosIniciales } from './datos/datos-iniciales';
import { RepositorioLocal } from './datos/repositorio-local';
import { Confirmacion } from './servicios/confirmacion';
import { Notificaciones } from './servicios/notificaciones';
import { Sesion } from './servicios/sesion';
import { Veterinarios } from './servicios/veterinarios';

interface Nota extends Entidad {
  texto: string;
}

const esNota = (valor: unknown): valor is Nota => tieneId(valor) && typeof valor['texto'] === 'string';

describe('Almacenamiento', () => {
  let almacenamiento: Almacenamiento;
  let motor: MotorMemoria;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: PROVEEDORES_MEMORIA });
    almacenamiento = TestBed.inject(Almacenamiento);
    motor = TestBed.inject(MotorAlmacenamiento) as MotorMemoria;
  });

  it('guarda y lee valores tipados con prefijo', () => {
    almacenamiento.escribir('nota', { id: 'n1', texto: 'Hola' });
    expect(motor.obtener('veterio.nota')).toBe('{"id":"n1","texto":"Hola"}');
    expect(almacenamiento.leer('nota', esNota)).toEqual({ id: 'n1', texto: 'Hola' });
  });

  it('devuelve null si el dato no cumple la guarda o el JSON está dañado', () => {
    almacenamiento.escribir('nota', { otro: 1 });
    expect(almacenamiento.leer('nota', esNota)).toBeNull();
    motor.guardar('veterio.roto', '{no es json');
    expect(almacenamiento.leer('roto', esNota)).toBeNull();
  });

  it('elimina y verifica claves', () => {
    almacenamiento.escribir('nota', { id: 'n1', texto: 'Hola' });
    expect(almacenamiento.existe('nota')).toBe(true);
    almacenamiento.eliminar('nota');
    expect(almacenamiento.existe('nota')).toBe(false);
  });
});

describe('RepositorioLocal', () => {
  let repositorio: RepositorioLocal<Nota>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: PROVEEDORES_MEMORIA });
    repositorio = new RepositorioLocal<Nota>(TestBed.inject(Almacenamiento), 'notas', esNota, () => [
      { id: 'n1', texto: 'Primera' },
    ]);
  });

  it('carga la semilla cuando el almacenamiento está vacío', () => {
    expect(repositorio.listar()).toEqual([{ id: 'n1', texto: 'Primera' }]);
  });

  it('crea, actualiza, busca y elimina', () => {
    repositorio.crear({ id: 'n2', texto: 'Segunda' });
    expect(repositorio.contar()).toBe(2);
    expect(repositorio.actualizar('n2', { texto: 'Cambiada' })?.texto).toBe('Cambiada');
    expect(repositorio.buscar((nota) => nota.texto.startsWith('C')).length).toBe(1);
    expect(repositorio.eliminar('n1')).toBe(true);
    expect(repositorio.eliminar('n1')).toBe(false);
    expect(repositorio.obtener('n2')?.texto).toBe('Cambiada');
  });

  it('no permite ids repetidos', () => {
    expect(() => repositorio.crear({ id: 'n1', texto: 'Otra' })).toThrowError();
  });

  it('no vuelve a cargar la semilla si la lista quedó vacía', () => {
    repositorio.eliminar('n1');
    expect(repositorio.listar()).toEqual([]);
  });
});

describe('Datos iniciales', () => {
  const datos = crearDatosIniciales(new Date(2026, 10, 3, 8, 0));

  it('tienen relaciones coherentes', () => {
    const duenos = new Set(datos.duenos.map((dueno) => dueno.id));
    const mascotas = new Set(datos.mascotas.map((mascota) => mascota.id));
    expect(datos.mascotas.every((mascota) => duenos.has(mascota.duenoId))).toBe(true);
    expect(datos.citas.every((cita) => mascotas.has(cita.mascotaId))).toBe(true);
    expect(esListaDe(datos.mascotas, esMascota)).toBe(true);
  });

  it('incluye un usuario por cada rol', () => {
    const roles = new Set(datos.usuarios.map((usuario) => usuario.rol));
    expect([...roles].sort()).toEqual(['administrador', 'recepcion', 'veterinario']);
  });

  it('ubica citas para el día de referencia', () => {
    expect(datos.citas.filter((cita) => cita.fecha === '2026-11-03').length).toBeGreaterThan(3);
  });
});

describe('Servicios de Core', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: PROVEEDORES_MEMORIA }));

  it('Sesion guarda al usuario sin la contraseña y valida roles', () => {
    const sesion = TestBed.inject(Sesion);
    sesion.abrir({
      id: 'usr-2',
      nombre: 'Rosa Quispe Mamani',
      correo: 'recepcion@veterio.pe',
      clave: 'Recepcion2026',
      rol: 'recepcion',
      activo: true,
      veterinarioId: null,
      creadoEn: '2024-05-01',
    });
    expect(sesion.autenticado).toBe(true);
    expect(JSON.stringify(sesion.usuario)).not.toContain('Recepcion2026');
    expect(sesion.tieneRol('recepcion')).toBe(true);
    expect(sesion.tieneRol(['administrador', 'veterinario'])).toBe(false);
    expect(TestBed.inject(Almacenamiento).existe('sesion')).toBe(true);
    sesion.cerrar();
    expect(sesion.usuario).toBeNull();
  });

  it('Notificaciones agrega y cierra avisos', () => {
    const notificaciones = TestBed.inject(Notificaciones);
    const id = notificaciones.mostrar('Guardado', 'exito', 0);
    expect(notificaciones.avisos.length).toBe(1);
    notificaciones.cerrar(id);
    expect(notificaciones.avisos.length).toBe(0);
  });

  it('Confirmacion resuelve la promesa con la respuesta', async () => {
    const confirmacion = TestBed.inject(Confirmacion);
    const respuesta = confirmacion.preguntar({ titulo: 'Salir', mensaje: '¿Seguro?' });
    const solicitud = await firstValueFrom(confirmacion.solicitud$);
    expect(solicitud?.textoConfirmar).toBe('Confirmar');
    confirmacion.responder(true);
    expect(await respuesta).toBe(true);
    expect(confirmacion.abierta).toBe(false);
  });

  it('Veterinarios expone instancias de la clase Veterinario', () => {
    const veterinarios = TestBed.inject(Veterinarios);
    expect(veterinarios.todos.length).toBe(3);
    expect(veterinarios.nombreDe('vet-2')).toBe('Dr. Torres');
    expect(veterinarios.nombreDe('no-existe')).toBe('Sin asignar');
  });
});
