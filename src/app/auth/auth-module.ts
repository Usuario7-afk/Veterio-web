import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { AuthRoutingModule } from './auth-routing-module';
import { TablaUsuarios } from './componentes/tabla-usuarios/tabla-usuarios';
import { FormularioUsuario } from './paginas/formulario-usuario/formulario-usuario';
import { ListaUsuarios } from './paginas/lista-usuarios/lista-usuarios';
import { Login } from './paginas/login/login';

@NgModule({
  declarations: [Login, ListaUsuarios, FormularioUsuario, TablaUsuarios],
  imports: [SharedModule, AuthRoutingModule],
})
export class AuthModule {}
