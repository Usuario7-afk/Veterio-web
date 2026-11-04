import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { UsuarioSesion } from '../../../shared/modelos/usuario';
import { OpcionMenu } from '../opciones-menu';

@Component({
  selector: 'app-menu-lateral',
  standalone: false,
  templateUrl: './menu-lateral.html',
  styleUrls: ['./menu-lateral.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuLateral {
  @Input({ required: true }) public usuario!: UsuarioSesion;
  @Input({ required: true }) public opciones: readonly OpcionMenu[] = [];
  @Output() public navegar = new EventEmitter<string>();
  @Output() public salir = new EventEmitter<void>();
  @Output() public cerrar = new EventEmitter<void>();
}
