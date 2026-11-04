import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Almacenamiento } from '../almacenamiento/almacenamiento';
import { esUsuarioSesion } from '../../shared/modelos/guardas';
import { Rol } from '../../shared/modelos/tipos';
import { Usuario, UsuarioSesion } from '../../shared/modelos/usuario';

export function sinClave(usuario: Usuario | UsuarioSesion): UsuarioSesion {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
    activo: usuario.activo,
    veterinarioId: usuario.veterinarioId,
    creadoEn: usuario.creadoEn,
  };
}

@Injectable({ providedIn: 'root' })
export class Sesion {
  private static readonly CLAVE = 'sesion';
  private readonly sujeto: BehaviorSubject<UsuarioSesion | null>;

  constructor(private almacenamiento: Almacenamiento) {
    this.sujeto = new BehaviorSubject<UsuarioSesion | null>(
      almacenamiento.leer(Sesion.CLAVE, esUsuarioSesion),
    );
  }

  public get usuario$(): Observable<UsuarioSesion | null> {
    return this.sujeto.asObservable();
  }

  public get usuario(): UsuarioSesion | null {
    return this.sujeto.value;
  }

  public get autenticado(): boolean {
    return this.sujeto.value !== null;
  }

  public get rol(): Rol | null {
    return this.sujeto.value?.rol ?? null;
  }

  public abrir(usuario: Usuario | UsuarioSesion): void {
    const datos = sinClave(usuario);
    this.almacenamiento.escribir(Sesion.CLAVE, datos);
    this.sujeto.next(datos);
  }

  public cerrar(): void {
    this.almacenamiento.eliminar(Sesion.CLAVE);
    this.sujeto.next(null);
  }

  public tieneRol(roles: Rol | readonly Rol[]): boolean {
    const rol = this.rol;
    if (rol === null) {
      return false;
    }
    const permitidos: readonly Rol[] = typeof roles === 'string' ? [roles] : roles;
    return permitidos.length === 0 || permitidos.includes(rol);
  }
}
