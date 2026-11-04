import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Dueno } from '../../../shared/modelos/dueno';
import { Mascota } from '../../../shared/modelos/mascota';

@Component({
  selector: 'app-ficha-mascota',
  standalone: false,
  templateUrl: './ficha-mascota.html',
  styleUrls: ['./ficha-mascota.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FichaMascota {
  @Input({ required: true }) public mascota!: Mascota;
  @Input() public dueno: Dueno | undefined;
  @Input() public puedeEditar = false;
  @Output() public editar = new EventEmitter<string>();
}
