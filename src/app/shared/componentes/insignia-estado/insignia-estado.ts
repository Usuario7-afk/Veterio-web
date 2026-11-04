import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EstadoCita } from '../../modelos/tipos';

@Component({
  selector: 'app-insignia-estado',
  standalone: false,
  templateUrl: './insignia-estado.html',
  styleUrls: ['./insignia-estado.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsigniaEstado {
  @Input({ required: true }) public estado!: EstadoCita;
  @Input() public conIcono = false;
}
