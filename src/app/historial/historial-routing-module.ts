import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormularioAtencion } from './paginas/formulario-atencion/formulario-atencion';
import { HistorialMascota } from './paginas/historial-mascota/historial-mascota';
import { SeleccionMascota } from './paginas/seleccion-mascota/seleccion-mascota';

const routes: Routes = [
  { path: '', component: SeleccionMascota, title: 'Historial | Veterio' },
  { path: ':mascotaId', component: HistorialMascota, title: 'Historial de la mascota | Veterio' },
  { path: ':mascotaId/nueva', component: FormularioAtencion, title: 'Registrar atención | Veterio' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistorialRoutingModule {}
