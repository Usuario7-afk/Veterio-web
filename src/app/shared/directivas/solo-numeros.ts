import { Directive, ElementRef, HostListener, Input, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[soloNumeros]',
  standalone: false,
  host: { inputmode: 'numeric' },
})
export class SoloNumeros {
  @Input() public soloNumeros: number | '' = '';

  constructor(
    private elemento: ElementRef<HTMLInputElement>,
    @Optional() @Self() private control: NgControl | null,
  ) {}

  @HostListener('input')
  public alEscribir(): void {
    const entrada = this.elemento.nativeElement;
    const limite = typeof this.soloNumeros === 'number' ? this.soloNumeros : undefined;
    const limpio = entrada.value.replace(/\D/g, '').slice(0, limite);
    if (limpio === entrada.value) {
      return;
    }
    entrada.value = limpio;
    this.control?.control?.setValue(limpio);
  }
}
