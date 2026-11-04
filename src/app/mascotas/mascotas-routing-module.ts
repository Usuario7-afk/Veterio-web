import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormularioMascota } from './paginas/formulario-mascota/formulario-mascota';
import { ListaMascotas } from './paginas/lista-mascotas/lista-mascotas';

const routes: Routes = [
  { path: '', component: ListaMascotas, title: 'Mascotas | Veterio' },
  { path: 'nueva', component: FormularioMascota, title: 'Registrar mascota | Veterio' },
  { path: ':id/editar', component: FormularioMascota, title: 'Editar mascota | Veterio' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MascotasRoutingModule {}
