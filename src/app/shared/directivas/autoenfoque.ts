import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[autoenfoque]',
  standalone: false,
})
export class Autoenfoque implements AfterViewInit {
  @Input() public autoenfoque: boolean | '' = true;

  constructor(private elemento: ElementRef<HTMLElement>) {}

  public ngAfterViewInit(): void {
    if (this.autoenfoque === false) {
      return;
    }
    setTimeout(() => this.elemento.nativeElement.focus(), 0);
  }
}
