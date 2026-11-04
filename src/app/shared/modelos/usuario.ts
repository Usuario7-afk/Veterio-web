import { Entidad, Rol } from './tipos';

export interface Usuario extends Entidad {
  nombre: string;
  correo: string;
  clave: string;
  rol: Rol;
  activo: boolean;
  veterinarioId: string | null;
  creadoEn: string;
}

export type NuevoUsuario = Omit<Usuario, 'id' | 'creadoEn'>;

export type CambiosUsuario = Partial<NuevoUsuario>;

export type UsuarioSesion = Omit<Usuario, 'clave'>;

export type Credenciales = Pick<Usuario, 'correo' | 'clave'>;

export interface CambioEstadoUsuario {
  id: string;
  activo: boolean;
}
