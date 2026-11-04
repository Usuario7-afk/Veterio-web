import { Atencion } from './atencion';
import { Cita } from './cita';
import { DatosDueno } from './dueno';
import { TipoEspecie } from './especie';
import { Mascota } from './mascota';
import { Persona } from './persona';
import { ESTADOS_CITA, Entidad, EstadoCita, ROLES, Rol, TIPOS_SERVICIO, TipoServicio } from './tipos';
import { Usuario, UsuarioSesion } from './usuario';
import { DatosVeterinario, Veterinario } from './veterinario';

type Registro = Record<string, unknown>;

export type Guarda<T> = (valor: unknown) => valor is T;

export function esObjeto(valor: unknown): valor is Registro {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function sonTextos(objeto: Registro, campos: readonly string[]): boolean {
  return campos.every((campo) => typeof objeto[campo] === 'string');
}

export function tieneId(valor: unknown): valor is Registro & Entidad {
  return esObjeto(valor) && typeof valor['id'] === 'string' && valor['id'].length > 0;
}

export function esListaDe<T>(valor: unknown, guarda: Guarda<T>): valor is T[] {
  return Array.isArray(valor) && valor.every((item) => guarda(item));
}

export function esRol(valor: unknown): valor is Rol {
  return Object.values(ROLES).some((rol) => rol === valor);
}

export function esEstadoCita(valor: unknown): valor is EstadoCita {
  return ESTADOS_CITA.some((estado) => estado === valor);
}

export function esTipoServicio(valor: unknown): valor is TipoServicio {
  return TIPOS_SERVICIO.some((tipo) => tipo === valor);
}

export function esTipoEspecie(valor: unknown): valor is TipoEspecie {
  return Object.values(TipoEspecie).some((especie) => especie === valor);
}

export function esVeterinario(persona: Persona): persona is Veterinario {
  return persona instanceof Veterinario;
}

export function esDatosDueno(valor: unknown): valor is DatosDueno {
  return (
    tieneId(valor) &&
    sonTextos(valor, ['nombres', 'apellidos', 'documento', 'telefono', 'correo', 'direccion'])
  );
}

export function esDatosVeterinario(valor: unknown): valor is DatosVeterinario {
  return (
    tieneId(valor) &&
    sonTextos(valor, ['nombres', 'apellidos', 'documento', 'colegiatura', 'especialidad']) &&
    (valor['tratamiento'] === 'Dr.' || valor['tratamiento'] === 'Dra.') &&
    Array.isArray(valor['diasAtencion'])
  );
}

export function esMascota(valor: unknown): valor is Mascota {
  return (
    tieneId(valor) &&
    sonTextos(valor, ['nombre', 'raza', 'fechaNacimiento', 'duenoId', 'fechaRegistro']) &&
    esTipoEspecie(valor['especie']) &&
    typeof valor['peso'] === 'number' &&
    Array.isArray(valor['alergias'])
  );
}

export function esCita(valor: unknown): valor is Cita {
  return (
    tieneId(valor) &&
    sonTextos(valor, ['mascotaId', 'veterinarioId', 'fecha', 'hora']) &&
    esEstadoCita(valor['estado']) &&
    esTipoServicio(valor['motivo'])
  );
}

export function esAtencion(valor: unknown): valor is Atencion {
  return (
    tieneId(valor) &&
    sonTextos(valor, ['mascotaId', 'veterinarioId', 'fecha', 'diagnostico']) &&
    esTipoServicio(valor['tipo']) &&
    Array.isArray(valor['medicamentos'])
  );
}

export function esUsuario(valor: unknown): valor is Usuario {
  return esObjeto(valor) && typeof valor['clave'] === 'string' && esUsuarioSesion(valor);
}

export function esUsuarioSesion(valor: unknown): valor is UsuarioSesion {
  return (
    tieneId(valor) &&
    sonTextos(valor, ['nombre', 'correo']) &&
    esRol(valor['rol']) &&
    typeof valor['activo'] === 'boolean'
  );
}
