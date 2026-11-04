import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormularioUsuario } from './paginas/formulario-usuario/formulario-usuario';
import { ListaUsuarios } from './paginas/lista-usuarios/lista-usuarios';
import { Login } from './paginas/login/login';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: Login, title: 'Iniciar sesión | Veterio' },
  { path: 'usuarios', component: ListaUsuarios, title: 'Usuarios | Veterio' },
  { path: 'usuarios/nuevo', component: FormularioUsuario, title: 'Nuevo usuario | Veterio' },
  { path: 'usuarios/:id/editar', component: FormularioUsuario, title: 'Editar usuario | Veterio' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
