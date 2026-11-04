import { Rol } from '../../shared/modelos/tipos';

export interface OpcionMenu {
  readonly ruta: string;
  readonly texto: string;
  readonly icono: string;
  readonly roles: readonly Rol[];
}

const TODOS: readonly Rol[] = ['administrador', 'recepcion', 'veterinario'];

export const OPCIONES_MENU: readonly OpcionMenu[] = [
  { ruta: '/inicio', texto: 'Inicio', icono: 'bi-house', roles: TODOS },
  { ruta: '/mascotas', texto: 'Mascotas', icono: 'bi-clipboard2-heart', roles: TODOS },
  { ruta: '/citas', texto: 'Citas', icono: 'bi-calendar3', roles: TODOS },
  { ruta: '/historial', texto: 'Historial', icono: 'bi-journal-medical', roles: TODOS },
  { ruta: '/cuenta/usuarios', texto: 'Usuarios', icono: 'bi-people', roles: ['administrador'] },
];
