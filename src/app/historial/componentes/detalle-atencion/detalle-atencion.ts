import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { AtencionVista } from '../../../shared/modelos/atencion';

@Component({
  selector: 'app-detalle-atencion',
  standalone: false,
  templateUrl: './detalle-atencion.html',
  styleUrls: ['./detalle-atencion.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleAtencion {
  @Input() public atencion: AtencionVista | null = null;
  @Input() public nombreMascota = '';
  @Output() public cerrar = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  public alPresionarEscape(): void {
    if (this.atencion) {
      this.cerrar.emit();
    }
  }
}
