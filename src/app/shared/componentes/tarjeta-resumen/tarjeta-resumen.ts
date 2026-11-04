import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export type VarianteResumen = 'primary' | 'success' | 'warning' | 'secondary';

@Component({
  selector: 'app-tarjeta-resumen',
  standalone: false,
  templateUrl: './tarjeta-resumen.html',
  styleUrls: ['./tarjeta-resumen.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarjetaResumen {
  @Input({ required: true }) public valor: number | string = 0;
  @Input({ required: true }) public etiqueta = '';
  @Input() public icono = 'bi-circle';
  @Input() public variante: VarianteResumen = 'primary';
  @Input() public seleccionable = false;
  @Output() public seleccionar = new EventEmitter<void>();

  public alSeleccionar(): void {
    if (this.seleccionable) {
      this.seleccionar.emit();
    }
  }
}
