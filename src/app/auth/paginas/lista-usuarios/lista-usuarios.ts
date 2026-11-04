import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, combineLatest, startWith } from 'rxjs';
import { Notificaciones } from '../../../core/servicios/notificaciones';
import { Sesion, sinClave } from '../../../core/servicios/sesion';
import { Veterinarios } from '../../../core/servicios/veterinarios';
import { ETIQUETAS_ROL, Rol } from '../../../shared/modelos/tipos';
import { CambioEstadoUsuario, Usuario, UsuarioSesion } from '../../../shared/modelos/usuario';
import { normalizarTexto, ordenarPor } from '../../../shared/utilidades/colecciones';
import { Usuarios } from '../../servicios/usuarios';

type FiltroRol = Rol | 'todos';

@Component({
  selector: 'app-lista-usuarios',
  standalone: false,
  templateUrl: './lista-usuarios.html',
  styleUrls: ['./lista-usuarios.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ListaUsuarios implements OnInit, OnDestroy {
  public usuariosVisibles: UsuarioSesion[] = [];
  public total = 0;
  public activos = 0;
  public idActual: string | null = null;
  public nombresVeterinario: Record<string, string> = {};
  public readonly roles = Object.entries(ETIQUETAS_ROL) as [Rol, string][];
  public readonly filtroRol = new FormControl<FiltroRol>('todos', { nonNullable: true });

  private texto = '';
  private suscripcion: Subscription | null = null;

  constructor(
    private usuarios: Usuarios,
    private veterinarios: Veterinarios,
    private sesion: Sesion,
    private router: Router,
    private notificaciones: Notificaciones,
  ) {}

  public ngOnInit(): void {
    this.idActual = this.sesion.usuario?.id ?? null;
    for (const veterinario of this.veterinarios.todos) {
      this.nombresVeterinario[veterinario.id] = veterinario.descripcion();
    }
    this.suscripcion = combineLatest([
      this.usuarios.lista$,
      this.filtroRol.valueChanges.pipe(startWith(this.filtroRol.value)),
    ]).subscribe(([lista]) => this.aplicarFiltros(lista));
  }

  public ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  public buscar(texto: string): void {
    this.texto = texto;
    this.aplicarFiltros(this.usuarios.lista);
  }

  public nuevo(): void {
    void this.router.navigate(['/cuenta/usuarios/nuevo']);
  }

  public editar(id: string): void {
    void this.router.navigate(['/cuenta/usuarios', id, 'editar']);
  }

  public cambiarEstado(cambio: CambioEstadoUsuario): void {
    const resultado = this.usuarios.cambiarEstado(cambio.id, cambio.activo);
    if (resultado.ok) {
      this.notificaciones.exito(cambio.activo ? 'Cuenta activada.' : 'Cuenta desactivada.');
    } else {
      this.notificaciones.error(resultado.error);
    }
  }

  private aplicarFiltros(lista: readonly Usuario[]): void {
    const rol = this.filtroRol.value;
    const texto = normalizarTexto(this.texto);
    const filtrados = lista.filter(
      (usuario) =>
        (rol === 'todos' || usuario.rol === rol) &&
        (!texto || normalizarTexto(`${usuario.nombre} ${usuario.correo}`).includes(texto)),
    );
    this.total = lista.length;
    this.activos = lista.filter((usuario) => usuario.activo).length;
    this.usuariosVisibles = ordenarPor(filtrados, (usuario) => usuario.nombre).map(sinClave);
  }
}
