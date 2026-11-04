import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MascotaConDueno } from '../../../shared/modelos/mascota';

@Component({
  selector: 'app-tabla-mascotas',
  standalone: false,
  templateUrl: './tabla-mascotas.html',
  styleUrls: ['./tabla-mascotas.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaMascotas {
  @Input({ required: true }) public items: readonly MascotaConDueno[] = [];
  @Input() public puedeEditar = false;
  @Input() public puedeAgendar = false;
  @Output() public editar = new EventEmitter<string>();
  @Output() public verHistorial = new EventEmitter<string>();
  @Output() public agendar = new EventEmitter<string>();

  public seguirPorId(_indice: number, item: MascotaConDueno): string {
    return item.mascota.id;
  }
}
