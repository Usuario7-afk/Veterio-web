import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelInicio } from './paginas/panel-inicio/panel-inicio';

const routes: Routes = [{ path: '', component: PanelInicio, title: 'Inicio | Veterio' }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InicioRoutingModule {}
