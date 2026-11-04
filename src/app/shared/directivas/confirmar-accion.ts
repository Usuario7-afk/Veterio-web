import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Confirmacion, VarianteConfirmacion } from '../../core/servicios/confirmacion';

@Directive({
  selector: '[confirmarAccion]',
  standalone: false,
})
export class ConfirmarAccion {
  @Input({ required: true }) public confirmarAccion = '';
  @Input() public tituloConfirmacion = 'Confirmar acción';
  @Input() public textoConfirmar = 'Confirmar';
  @Input() public varianteConfirmacion: VarianteConfirmacion = 'danger';
  @Output() public confirmado = new EventEmitter<void>();

  constructor(private confirmacion: Confirmacion) {}

  @HostListener('click', ['$event'])
  public async alHacerClic(evento: Event): Promise<void> {
    evento.preventDefault();
    evento.stopPropagation();
    const aceptado = await this.confirmacion.preguntar({
      titulo: this.tituloConfirmacion,
      mensaje: this.confirmarAccion,
      textoConfirmar: this.textoConfirmar,
      variante: this.varianteConfirmacion,
    });
    if (aceptado) {
      this.confirmado.emit();
    }
  }
}
