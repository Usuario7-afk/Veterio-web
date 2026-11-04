import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { ListaCitasDia } from './componentes/lista-citas-dia/lista-citas-dia';
import { InicioRoutingModule } from './inicio-routing-module';
import { PanelInicio } from './paginas/panel-inicio/panel-inicio';

@NgModule({
  declarations: [PanelInicio, ListaCitasDia],
  imports: [SharedModule, InicioRoutingModule],
})
export class InicioModule {}
