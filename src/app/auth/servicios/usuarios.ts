import { Injectable } from '@angular/core';
import { Observable, map, timer } from 'rxjs';
import { Almacenamiento } from '../../core/almacenamiento/almacenamiento';
import { ColeccionReactiva } from '../../core/datos/coleccion-reactiva';
import { datosIniciales } from '../../core/datos/datos-iniciales';
import { RepositorioLocal } from '../../core/datos/repositorio-local';
import { esUsuario } from '../../shared/modelos/guardas';
import { Resultado, exito, fallo } from '../../shared/modelos/tipos';
import { CambiosUsuario, NuevoUsuario, Usuario } from '../../shared/modelos/usuario';
import { generarId } from '../../shared/utilidades/colecciones';
import { hoyISO } from '../../shared/utilidades/fechas';

export const LONGITUD_MINIMA_CLAVE = 8;

@Injectable({ providedIn: 'root' })
export class Usuarios extends ColeccionReactiva<Usuario> {
  public retardoVerificacion = 300;

  constructor(almacenamiento: Almacenamiento) {
    super(new RepositorioLocal<Usuario>(almacenamiento, 'usuarios', esUsuario, () => datosIniciales().usuarios));
  }

  public buscarPorCorreo(correo: string): Usuario | undefined {
    const buscado = correo.trim().toLowerCase();
    return this.lista.find((usuario) => usuario.correo === buscado);
  }

  public correoDisponible(correo: string, excluirId: string | null = null): Observable<boolean> {
    return timer(this.retardoVerificacion).pipe(
      map(() => {
        const existente = this.buscarPorCorreo(correo);
        return !existente || existente.id === excluirId;
      }),
    );
  }

  public crear(datos: NuevoUsuario): Resultado<Usuario> {
    const correo = datos.correo.trim().toLowerCase();
    if (this.buscarPorCorreo(correo)) {
      return fallo('El correo ya está registrado.');
    }
    if (datos.clave.length < LONGITUD_MINIMA_CLAVE) {
      return fallo(`La contraseña debe tener al menos ${LONGITUD_MINIMA_CLAVE} caracteres.`);
    }
    const usuario = this.agregar({
      ...datos,
      nombre: datos.nombre.trim(),
      correo,
      veterinarioId: datos.rol === 'veterinario' ? datos.veterinarioId : null,
      id: generarId('usr'),
      creadoEn: hoyISO(),
    });
    return exito(usuario);
  }

  public actualizar(id: string, cambios: CambiosUsuario): Resultado<Usuario> {
    const actual = this.obtener(id);
    if (!actual) {
      return fallo('El usuario no existe.');
    }
    const correo = cambios.correo?.trim().toLowerCase();
    if (correo !== undefined) {
      const existente = this.buscarPorCorreo(correo);
      if (existente && existente.id !== id) {
        return fallo('El correo ya está registrado.');
      }
    }
    const { clave, ...resto } = cambios;
    const datos: CambiosUsuario = { ...resto };
    if (correo !== undefined) {
      datos.correo = correo;
    }
    if (clave) {
      datos.clave = clave;
    }
    const rol = cambios.rol ?? actual.rol;
    if (rol !== 'veterinario') {
      datos.veterinarioId = null;
    }
    const actualizado = this.modificar(id, datos);
    return actualizado ? exito(actualizado) : fallo('No se pudo guardar el usuario.');
  }

  public cambiarEstado(id: string, activo: boolean): Resultado<Usuario> {
    const actualizado = this.modificar(id, { activo });
    return actualizado ? exito(actualizado) : fallo('El usuario no existe.');
  }
}
