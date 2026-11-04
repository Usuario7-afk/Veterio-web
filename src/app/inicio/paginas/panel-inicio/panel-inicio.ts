import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { Notificaciones } from '../../../core/servicios/notificaciones';
import { Sesion } from '../../../core/servicios/sesion';
import { Citas } from '../../../citas/servicios/citas';
import { Atenciones } from '../../../historial/servicios/atenciones';
import { Mascotas } from '../../../mascotas/servicios/mascotas';
import { AccionesCita } from '../../../shared/componentes/tarjeta-cita/tarjeta-cita';
import { CambioEstadoCita, CitaDetallada } from '../../../shared/modelos/cita';
import { hoyISO } from '../../../shared/utilidades/fechas';

interface Resumen {
  citasHoy: number;
  pendientes: number;
  mascotas: number;
  atencionesMes: number;
}

@Component({
  selector: 'app-panel-inicio',
  standalone: false,
  templateUrl: './panel-inicio.html',
  styleUrls: ['./panel-inicio.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class PanelInicio implements OnInit, OnDestroy {
  public ahora = new Date();
  public hoy = hoyISO(this.ahora);
  public resumen: Resumen = { citasHoy: 0, pendientes: 0, mascotas: 0, atencionesMes: 0 };
  public citasHoy: CitaDetallada[] = [];
  public proximas: CitaDetallada[] = [];
  public nombre = '';
  public esVeterinario = false;
  public acciones: AccionesCita = { confirmar: false, cancelar: false, atender: false };

  private veterinarioId: string | null = null;
  private suscripcion: Subscription | null = null;

  constructor(
    private citas: Citas,
    private mascotas: Mascotas,
    private atenciones: Atenciones,
    private sesion: Sesion,
    private router: Router,
    private notificaciones: Notificaciones,
  ) {}

  public ngOnInit(): void {
    const usuario = this.sesion.usuario;
    this.nombre = usuario?.nombre.split(' ')[0] ?? '';
    this.esVeterinario = usuario?.rol === 'veterinario';
    this.veterinarioId = this.esVeterinario ? (usuario?.veterinarioId ?? null) : null;
    this.acciones = {
      confirmar: this.sesion.tieneRol(['administrador', 'recepcion']),
      cancelar: false,
      atender: this.sesion.tieneRol(['administrador', 'veterinario']),
    };
    this.suscripcion = combineLatest([
      this.citas.lista$,
      this.mascotas.lista$,
      this.atenciones.lista$,
    ]).subscribe(() => this.recalcular());
  }

  public ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  public confirmar(id: string): void {
    this.aplicarCambio({ id, estado: 'confirmada' });
  }

  public aplicarCambio(cambio: CambioEstadoCita): void {
    const resultado = this.citas.cambiarEstado(cambio.id, cambio.estado);
    if (resultado.ok) {
      this.notificaciones.exito(cambio.estado === 'confirmada' ? 'Cita confirmada.' : 'Cita actualizada.');
    } else {
      this.notificaciones.error(resultado.error);
    }
  }

  public atender(cita: CitaDetallada): void {
    void this.router.navigate(['/historial', cita.mascotaId, 'nueva'], { queryParams: { cita: cita.id } });
  }

  public verHistorial(mascotaId: string): void {
    void this.router.navigate(['/historial', mascotaId]);
  }

  public ir(ruta: string): void {
    void this.router.navigate([ruta]);
  }

  private recalcular(): void {
    this.ahora = new Date();
    this.hoy = hoyISO(this.ahora);
    this.citasHoy = this.citas.delDia(this.hoy, this.veterinarioId);
    this.proximas = this.citas.proximas(this.ahora, 5, this.veterinarioId);
    const atencionesMes = this.atenciones
      .delMes(this.ahora.getFullYear(), this.ahora.getMonth())
      .filter((atencion) => this.veterinarioId === null || atencion.veterinarioId === this.veterinarioId);
    this.resumen = {
      citasHoy: this.citasHoy.filter((cita) => cita.estado !== 'cancelada').length,
      pendientes: this.citasHoy.filter((cita) => cita.estado === 'pendiente').length,
      mascotas: this.mascotas.lista.length,
      atencionesMes: atencionesMes.length,
    };
  }
}
