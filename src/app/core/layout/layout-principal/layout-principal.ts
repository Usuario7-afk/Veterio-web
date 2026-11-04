import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { UsuarioSesion } from '../../../shared/modelos/usuario';
import { Confirmacion, SolicitudConfirmacion } from '../../servicios/confirmacion';
import { Notificaciones } from '../../servicios/notificaciones';
import { Sesion } from '../../servicios/sesion';
import { OPCIONES_MENU, OpcionMenu } from '../opciones-menu';

const RUTA_LOGIN = '/cuenta/login';

@Component({
  selector: 'app-layout-principal',
  standalone: false,
  templateUrl: './layout-principal.html',
  styleUrls: ['./layout-principal.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class LayoutPrincipal implements OnInit, OnDestroy {
  public usuario: UsuarioSesion | null = null;
  public menuAbierto = false;
  public enLogin = false;
  public solicitud: SolicitudConfirmacion | null = null;
  public readonly opciones: readonly OpcionMenu[] = OPCIONES_MENU;
  public readonly anio = new Date().getFullYear();

  private readonly suscripciones = new Subscription();

  constructor(
    private sesion: Sesion,
    private router: Router,
    private confirmacion: Confirmacion,
    private notificaciones: Notificaciones,
  ) {}

  public ngOnInit(): void {
    this.enLogin = this.esLogin(this.router.url);
    this.suscripciones.add(this.sesion.usuario$.subscribe((usuario) => (this.usuario = usuario)));
    this.suscripciones.add(
      this.confirmacion.solicitud$.subscribe((solicitud) => (this.solicitud = solicitud)),
    );
    this.suscripciones.add(
      this.router.events
        .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
        .subscribe((evento) => {
          this.enLogin = this.esLogin(evento.urlAfterRedirects);
          this.menuAbierto = false;
        }),
    );
  }

  public ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }

  public alternarMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  public cerrarMenu(): void {
    this.menuAbierto = false;
  }

  public cerrarSesion(): void {
    this.sesion.cerrar();
    this.menuAbierto = false;
    this.notificaciones.mostrar('Sesión cerrada.', 'info');
    void this.router.navigate([RUTA_LOGIN]);
  }

  public responder(aceptado: boolean): void {
    this.confirmacion.responder(aceptado);
  }

  private esLogin(url: string): boolean {
    return url.startsWith(RUTA_LOGIN);
  }
}
