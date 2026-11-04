import { Injectable } from '@angular/core';
import { Sesion } from '../../core/servicios/sesion';
import { Resultado, exito, fallo } from '../../shared/modelos/tipos';
import { Credenciales, UsuarioSesion } from '../../shared/modelos/usuario';
import { Usuarios } from './usuarios';

@Injectable({ providedIn: 'root' })
export class Autenticacion {
  constructor(
    private usuarios: Usuarios,
    private sesion: Sesion,
  ) {}

  public iniciarSesion(credenciales: Credenciales): Resultado<UsuarioSesion> {
    const usuario = this.usuarios.buscarPorCorreo(credenciales.correo);
    if (!usuario || usuario.clave !== credenciales.clave) {
      return fallo('Correo o contraseña incorrectos.');
    }
    if (!usuario.activo) {
      return fallo('Tu cuenta está desactivada. Consulta con el administrador.');
    }
    this.sesion.abrir(usuario);
    const abierta = this.sesion.usuario;
    return abierta ? exito(abierta) : fallo('No se pudo iniciar la sesión.');
  }

  public cerrarSesion(): void {
    this.sesion.cerrar();
  }
}
