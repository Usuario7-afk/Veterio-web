import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AtencionVista } from '../../../shared/modelos/atencion';

@Component({
  selector: 'app-linea-tiempo',
  standalone: false,
  templateUrl: './linea-tiempo.html',
  styleUrls: ['./linea-tiempo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineaTiempo {
  @Input({ required: true }) public atenciones: readonly AtencionVista[] = [];
  @Output() public seleccionar = new EventEmitter<AtencionVista>();

  public seguirPorId(_indice: number, atencion: AtencionVista): string {
    return atencion.id;
  }
}
