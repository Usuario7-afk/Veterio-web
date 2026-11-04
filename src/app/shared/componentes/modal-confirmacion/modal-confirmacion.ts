import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { VarianteConfirmacion } from '../../../core/servicios/confirmacion';

@Component({
  selector: 'app-modal-confirmacion',
  standalone: false,
  templateUrl: './modal-confirmacion.html',
  styleUrls: ['./modal-confirmacion.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalConfirmacion {
  @Input() public visible = false;
  @Input() public titulo = 'Confirmar';
  @Input() public mensaje = '';
  @Input() public textoConfirmar = 'Confirmar';
  @Input() public textoCancelar = 'Cancelar';
  @Input() public variante: VarianteConfirmacion = 'primary';
  @Output() public confirmar = new EventEmitter<void>();
  @Output() public cancelar = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  public alPresionarEscape(): void {
    if (this.visible) {
      this.cancelar.emit();
    }
  }
}
