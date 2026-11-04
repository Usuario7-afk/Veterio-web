import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgendaCitas } from './paginas/agenda-citas/agenda-citas';
import { FormularioCita } from './paginas/formulario-cita/formulario-cita';

const routes: Routes = [
  { path: '', component: AgendaCitas, title: 'Agenda de citas | Veterio' },
  { path: 'nueva', component: FormularioCita, title: 'Nueva cita | Veterio' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CitasRoutingModule {}
