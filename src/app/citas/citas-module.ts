import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { CitasRoutingModule } from './citas-routing-module';
import { CalendarioMensual } from './componentes/calendario-mensual/calendario-mensual';
import { SelectorHorario } from './componentes/selector-horario/selector-horario';
import { AgendaCitas } from './paginas/agenda-citas/agenda-citas';
import { FormularioCita } from './paginas/formulario-cita/formulario-cita';

@NgModule({
  declarations: [AgendaCitas, FormularioCita, CalendarioMensual, SelectorHorario],
  imports: [SharedModule, CitasRoutingModule],
})
export class CitasModule {}
