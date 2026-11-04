import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Persona } from '../../modelos/persona';

@Component({
  selector: 'app-tarjeta-persona',
  standalone: false,
  templateUrl: './tarjeta-persona.html',
  styleUrls: ['./tarjeta-persona.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarjetaPersona {
  @Input({ required: true }) public persona: Persona | null | undefined = null;
  @Input() public mostrarContacto = true;
}
