import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-estado-vacio',
  standalone: false,
  templateUrl: './estado-vacio.html',
  styleUrls: ['./estado-vacio.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadoVacio {
  @Input() public imagen = '';
  @Input() public icono = 'bi-inbox';
  @Input({ required: true }) public titulo = '';
  @Input() public mensaje = '';
  @Input() public textoAccion = '';
  @Output() public accion = new EventEmitter<void>();

  public imagenDisponible = true;

  public alFallarImagen(): void {
    this.imagenDisponible = false;
  }
}
