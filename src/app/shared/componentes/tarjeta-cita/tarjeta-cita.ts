import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CambioEstadoCita, CitaDetallada } from '../../modelos/cita';

export interface AccionesCita {
  confirmar: boolean;
  cancelar: boolean;
  atender: boolean;
}

export const SIN_ACCIONES: AccionesCita = { confirmar: false, cancelar: false, atender: false };

@Component({
  selector: 'app-tarjeta-cita',
  standalone: false,
  templateUrl: './tarjeta-cita.html',
  styleUrls: ['./tarjeta-cita.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarjetaCita {
  @Input({ required: true }) public cita!: CitaDetallada;
  @Input() public mostrarMascota = true;
  @Input() public mostrarVeterinario = true;
  @Input() public mostrarFecha = false;
  @Input() public acciones: AccionesCita = SIN_ACCIONES;
  @Input() public referencia: Date | null = null;
  @Output() public cambiarEstado = new EventEmitter<CambioEstadoCita>();
  @Output() public atender = new EventEmitter<CitaDetallada>();
  @Output() public verHistorial = new EventEmitter<string>();

  public get activa(): boolean {
    return this.cita.estado === 'pendiente' || this.cita.estado === 'confirmada';
  }
}
