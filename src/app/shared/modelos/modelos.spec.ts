import { Dueno } from './dueno';
import { TipoEspecie } from './especie';
import {
  esCita,
  esEstadoCita,
  esListaDe,
  esMascota,
  esRol,
  esTipoEspecie,
  esUsuario,
  esUsuarioSesion,
  esVeterinario,
} from './guardas';
import { Persona } from './persona';
import { exito, fallo } from './tipos';
import { Veterinario } from './veterinario';

const dueno = new Dueno({
  id: 'due-1',
  nombres: 'Jorge',
  apellidos: 'Huamán Torres',
  documento: '45781236',
  telefono: '987654321',
  correo: 'JHuaman@Gmail.com ',
  direccion: 'Av. Arequipa 1520, Lince',
});

const veterinario = new Veterinario({
  id: 'vet-1',
  tratamiento: 'Dra.',
  nombres: 'Andrea',
  apellidos: 'Salazar Ríos',
  documento: '41258963',
  telefono: '984512367',
  correo: 'asalazar@veterio.pe',
  colegiatura: '8421',
  especialidad: 'Medicina general',
  diasAtencion: [6, 1, 2],
});

describe('Modelos de persona', () => {
  it('comparten datos comunes desde la clase base', () => {
    expect(dueno.nombreCompleto).toBe('Jorge Huamán Torres');
    expect(dueno.iniciales).toBe('JH');
    expect(dueno.correo).toBe('jhuaman@gmail.com');
  });

  it('describen cada tipo de persona de forma polimórfica', () => {
    const personas: Persona[] = [dueno, veterinario];
    expect(personas.map((persona) => persona.tipo)).toEqual(['Dueño', 'Veterinario']);
    expect(personas.map((persona) => persona.descripcion())).toEqual([
      'DNI 45781236 · Cel. 987654321',
      'Medicina general · CMVP 8421',
    ]);
  });

  it('busca por nombre o documento', () => {
    expect(dueno.coincideCon('huamán')).toBe(true);
    expect(dueno.coincideCon('4578')).toBe(true);
    expect(dueno.coincideCon('luna')).toBe(false);
  });

  it('el veterinario conoce sus días de atención', () => {
    expect(veterinario.nombreCorto).toBe('Dra. Salazar');
    expect(veterinario.diasAtencion).toEqual([1, 2, 6]);
    expect(veterinario.atiendeEl(new Date(2026, 10, 3))).toBe(true);
    expect(veterinario.atiendeEl(new Date(2026, 10, 4))).toBe(false);
  });

  it('serializa a datos planos', () => {
    expect(JSON.parse(JSON.stringify(dueno))).toEqual({
      id: 'due-1',
      nombres: 'Jorge',
      apellidos: 'Huamán Torres',
      documento: '45781236',
      telefono: '987654321',
      correo: 'jhuaman@gmail.com',
      direccion: 'Av. Arequipa 1520, Lince',
    });
  });
});

describe('Guardas de tipo', () => {
  it('reconocen valores de uniones y enums', () => {
    expect(esRol('recepcion')).toBe(true);
    expect(esRol('cliente')).toBe(false);
    expect(esEstadoCita('atendida')).toBe(true);
    expect(esEstadoCita('perdida')).toBe(false);
    expect(esTipoEspecie(TipoEspecie.Ave)).toBe(true);
    expect(esTipoEspecie('pez')).toBe(false);
  });

  it('distinguen veterinarios de otras personas', () => {
    expect(esVeterinario(veterinario)).toBe(true);
    expect(esVeterinario(dueno)).toBe(false);
  });

  it('validan objetos leídos del almacenamiento', () => {
    const mascota = {
      id: 'mas-1',
      nombre: 'Rocky',
      especie: 'perro',
      raza: 'Labrador',
      sexo: 'macho',
      fechaNacimiento: '2021-03-12',
      peso: 28.5,
      color: 'Dorado',
      alergias: [],
      observaciones: '',
      duenoId: 'due-1',
      fechaRegistro: '2024-02-14',
    };
    expect(esMascota(mascota)).toBe(true);
    expect(esMascota({ ...mascota, especie: 'dinosaurio' })).toBe(false);
    expect(esListaDe([mascota, mascota], esMascota)).toBe(true);
    expect(esListaDe([mascota, null], esMascota)).toBe(false);
    expect(esCita({ id: 'c', mascotaId: 'm', veterinarioId: 'v', fecha: 'f', hora: 'h', estado: 'pendiente', motivo: 'consulta' })).toBe(true);
  });

  it('diferencian usuario completo de usuario en sesión', () => {
    const sesion = { id: 'usr-1', nombre: 'Patricia', correo: 'admin@veterio.pe', rol: 'administrador', activo: true };
    expect(esUsuarioSesion(sesion)).toBe(true);
    expect(esUsuario(sesion)).toBe(false);
    expect(esUsuario({ ...sesion, clave: 'Admin2026' })).toBe(true);
  });

  it('el tipo Resultado distingue éxito y fallo', () => {
    const bien = exito(5);
    const mal = fallo<number>('error');
    expect(bien.ok && bien.valor).toBe(5);
    expect(!mal.ok && mal.error).toBe('error');
  });
});
