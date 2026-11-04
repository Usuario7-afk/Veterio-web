import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-seccion-numerada',
  standalone: false,
  templateUrl: './seccion-numerada.html',
  styleUrls: ['./seccion-numerada.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeccionNumerada {
  @Input() public numero: number | null = null;
  @Input({ required: true }) public titulo = '';
  @Input() public descripcion = '';
}
