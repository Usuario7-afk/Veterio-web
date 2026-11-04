import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { Sesion } from '../../core/servicios/sesion';
import { Rol } from '../modelos/tipos';

@Directive({
  selector: '[tieneRol]',
  standalone: false,
})
export class TieneRol implements OnInit, OnDestroy {
  private roles: readonly Rol[] = [];
  private plantillaAlterna: TemplateRef<unknown> | null = null;
  private visible: boolean | null = null;
  private suscripcion: Subscription | null = null;

  constructor(
    private plantilla: TemplateRef<unknown>,
    private contenedor: ViewContainerRef,
    private sesion: Sesion,
    private cambios: ChangeDetectorRef,
  ) {}

  @Input()
  public set tieneRol(roles: Rol | readonly Rol[]) {
    this.roles = typeof roles === 'string' ? [roles] : roles;
    this.actualizar();
  }

  @Input()
  public set tieneRolSino(plantilla: TemplateRef<unknown> | null) {
    this.plantillaAlterna = plantilla;
    this.visible = null;
    this.actualizar();
  }

  public ngOnInit(): void {
    this.suscripcion = this.sesion.usuario$.subscribe(() => this.actualizar());
  }

  public ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  private actualizar(): void {
    const permitido = this.sesion.tieneRol(this.roles);
    if (permitido === this.visible) {
      return;
    }
    this.visible = permitido;
    this.contenedor.clear();
    if (permitido) {
      this.contenedor.createEmbeddedView(this.plantilla);
    } else if (this.plantillaAlterna) {
      this.contenedor.createEmbeddedView(this.plantillaAlterna);
    }
    this.cambios.markForCheck();
  }
}
