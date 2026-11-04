import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CitaDetallada } from '../../../shared/modelos/cita';
import { AccionesCita, SIN_ACCIONES } from '../../../shared/componentes/tarjeta-cita/tarjeta-cita';

@Component({
  selector: 'app-lista-citas-dia',
  standalone: false,
  templateUrl: './lista-citas-dia.html',
  styleUrls: ['./lista-citas-dia.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaCitasDia {
  @Input({ required: true }) public citas: readonly CitaDetallada[] = [];
  @Input() public acciones: AccionesCita = SIN_ACCIONES;
  @Input() public mostrarVeterinario = true;
  @Output() public confirmar = new EventEmitter<string>();
  @Output() public atender = new EventEmitter<CitaDetallada>();
  @Output() public verHistorial = new EventEmitter<string>();

  public seguirPorId(_indice: number, cita: CitaDetallada): string {
    return cita.id;
  }

  public activa(cita: CitaDetallada): boolean {
    return cita.estado === 'pendiente' || cita.estado === 'confirmada';
  }
}
