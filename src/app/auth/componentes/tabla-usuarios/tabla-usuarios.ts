import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CambioEstadoUsuario, UsuarioSesion } from '../../../shared/modelos/usuario';

@Component({
  selector: 'app-tabla-usuarios',
  standalone: false,
  templateUrl: './tabla-usuarios.html',
  styleUrls: ['./tabla-usuarios.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaUsuarios {
  @Input({ required: true }) public usuarios: readonly UsuarioSesion[] = [];
  @Input() public idActual: string | null = null;
  @Input() public nombresVeterinario: Readonly<Record<string, string>> = {};
  @Output() public editar = new EventEmitter<string>();
  @Output() public cambiarEstado = new EventEmitter<CambioEstadoUsuario>();

  public seguirPorId(_indice: number, usuario: UsuarioSesion): string {
    return usuario.id;
  }

  public mensajeEstado(usuario: UsuarioSesion): string {
    return usuario.activo
      ? `La cuenta de ${usuario.nombre} no podrá iniciar sesión hasta que se vuelva a activar.`
      : `La cuenta de ${usuario.nombre} podrá iniciar sesión otra vez.`;
  }
}
