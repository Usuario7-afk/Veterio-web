import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, combineLatest, startWith } from 'rxjs';
import { Notificaciones } from '../../../core/servicios/notificaciones';
import { Sesion } from '../../../core/servicios/sesion';
import { Veterinarios } from '../../../core/servicios/veterinarios';
import { AccionesCita } from '../../../shared/componentes/tarjeta-cita/tarjeta-cita';
import { CambioEstadoCita, CitaDetallada } from '../../../shared/modelos/cita';
import { Veterinario } from '../../../shared/modelos/veterinario';
import { moverMes } from '../../../shared/utilidades/calendario';
import { desdeISO, esFechaISO, hoyISO } from '../../../shared/utilidades/fechas';
import { Citas } from '../../servicios/citas';

const MENSAJES_ESTADO: Readonly<Record<string, string>> = {
  confirmada: 'Cita confirmada.',
  cancelada: 'Cita cancelada.',
};

@Component({
  selector: 'app-agenda-citas',
  standalone: false,
  templateUrl: './agenda-citas.html',
  styleUrls: ['./agenda-citas.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class AgendaCitas implements OnInit, OnDestroy {
  public hoy = hoyISO();
  public anio = new Date().getFullYear();
  public mes = new Date().getMonth();
  public seleccionada = this.hoy;
  public conteos: Record<string, number> = {};
  public citasDia: CitaDetallada[] = [];
  public veterinarios: readonly Veterinario[] = [];
  public acciones: AccionesCita = { confirmar: false, cancelar: false, atender: false };
  public puedeAgendar = false;
  public readonly filtroVeterinario = new FormControl('', { nonNullable: true });

  private suscripcion: Subscription | null = null;

  constructor(
    private citas: Citas,
    private servicioVeterinarios: Veterinarios,
    private sesion: Sesion,
    private ruta: ActivatedRoute,
    private router: Router,
    private notificaciones: Notificaciones,
  ) {}

  public get fechaPasada(): boolean {
    return this.seleccionada < this.hoy;
  }

  public ngOnInit(): void {
    this.veterinarios = this.servicioVeterinarios.todos;
    this.puedeAgendar = this.sesion.tieneRol(['administrador', 'recepcion']);
    this.acciones = {
      confirmar: this.puedeAgendar,
      cancelar: this.puedeAgendar,
      atender: this.sesion.tieneRol(['administrador', 'veterinario']),
    };
    const usuario = this.sesion.usuario;
    if (usuario?.rol === 'veterinario' && usuario.veterinarioId) {
      this.filtroVeterinario.setValue(usuario.veterinarioId);
    }
    const fecha = this.ruta.snapshot.queryParamMap.get('fecha');
    if (fecha && esFechaISO(fecha)) {
      this.seleccionar(fecha);
    }
    this.suscripcion = combineLatest([
      this.citas.lista$,
      this.filtroVeterinario.valueChanges.pipe(startWith(this.filtroVeterinario.value)),
    ]).subscribe(() => this.recalcular());
  }

  public ngOnDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  public seleccionar(fecha: string): void {
    const dia = desdeISO(fecha);
    this.seleccionada = fecha;
    this.anio = dia.getFullYear();
    this.mes = dia.getMonth();
    this.recalcular();
  }

  public cambiarMes(delta: number): void {
    const destino = moverMes(this.anio, this.mes, delta);
    this.anio = destino.anio;
    this.mes = destino.mes;
  }

  public nuevaCita(): void {
    const queryParams: Record<string, string> = { fecha: this.fechaPasada ? this.hoy : this.seleccionada };
    if (this.filtroVeterinario.value) {
      queryParams['veterinario'] = this.filtroVeterinario.value;
    }
    void this.router.navigate(['/citas/nueva'], { queryParams });
  }

  public aplicarCambio(cambio: CambioEstadoCita): void {
    const resultado = this.citas.cambiarEstado(cambio.id, cambio.estado);
    if (resultado.ok) {
      this.notificaciones.exito(MENSAJES_ESTADO[cambio.estado] ?? 'Cita actualizada.');
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

  public seguirPorId(_indice: number, cita: CitaDetallada): string {
    return cita.id;
  }

  private recalcular(): void {
    const veterinarioId = this.filtroVeterinario.value || null;
    this.hoy = hoyISO();
    this.conteos = this.citas.conteoPorDia(veterinarioId);
    this.citasDia = this.citas.delDia(this.seleccionada, veterinarioId);
  }
}
