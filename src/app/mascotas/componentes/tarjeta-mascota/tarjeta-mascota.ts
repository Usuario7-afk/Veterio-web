import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MascotaConDueno } from '../../../shared/modelos/mascota';

@Component({
  selector: 'app-tarjeta-mascota',
  standalone: false,
  templateUrl: './tarjeta-mascota.html',
  styleUrls: ['./tarjeta-mascota.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarjetaMascota {
  @Input({ required: true }) public item!: MascotaConDueno;
  @Input() public puedeEditar = false;
  @Input() public puedeAgendar = false;
  @Output() public editar = new EventEmitter<string>();
  @Output() public verHistorial = new EventEmitter<string>();
  @Output() public agendar = new EventEmitter<string>();
}
