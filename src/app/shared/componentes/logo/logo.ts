import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: false,
  templateUrl: './logo.html',
  styleUrls: ['./logo.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Logo {
  @Input() public claro = false;
  @Input() public alto = 36;
  @Input() public conTexto = false;

  public readonly ruta = 'imagenes/logo-veterio.png';
  public imagenDisponible = true;

  public alFallarImagen(): void {
    this.imagenDisponible = false;
  }
}
