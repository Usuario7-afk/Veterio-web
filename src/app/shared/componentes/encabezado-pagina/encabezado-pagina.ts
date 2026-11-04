import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-encabezado-pagina',
  standalone: false,
  templateUrl: './encabezado-pagina.html',
  styleUrls: ['./encabezado-pagina.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncabezadoPagina {
  @Input({ required: true }) public titulo = '';
  @Input() public subtitulo = '';
}
