import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { ESPECIES, Especie, TipoEspecie } from '../../modelos/especie';

export type TamanoAvatar = 'sm' | 'md' | 'lg';

const ICONOS: Readonly<Record<TipoEspecie, string>> = {
  [TipoEspecie.Perro]: 'bi-heart-pulse',
  [TipoEspecie.Gato]: 'bi-heart-pulse',
  [TipoEspecie.Ave]: 'bi-feather',
  [TipoEspecie.Conejo]: 'bi-flower1',
  [TipoEspecie.Otro]: 'bi-bug',
};

@Component({
  selector: 'app-avatar-especie',
  standalone: false,
  templateUrl: './avatar-especie.html',
  styleUrls: ['./avatar-especie.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarEspecie implements OnChanges {
  @Input({ required: true }) public especie: TipoEspecie = TipoEspecie.Otro;
  @Input() public tamano: TamanoAvatar = 'md';
  @Input() public nombre = '';

  public datos: Especie = ESPECIES[TipoEspecie.Otro];
  public icono = ICONOS[TipoEspecie.Otro];
  public imagenDisponible = true;

  public ngOnChanges(): void {
    this.datos = ESPECIES[this.especie] ?? ESPECIES[TipoEspecie.Otro];
    this.icono = ICONOS[this.datos.codigo];
    this.imagenDisponible = true;
  }

  public alFallarImagen(): void {
    this.imagenDisponible = false;
  }
}
