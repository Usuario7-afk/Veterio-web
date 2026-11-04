import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { DatosDueno } from './componentes/datos-dueno/datos-dueno';
import { TablaMascotas } from './componentes/tabla-mascotas/tabla-mascotas';
import { TarjetaMascota } from './componentes/tarjeta-mascota/tarjeta-mascota';
import { MascotasRoutingModule } from './mascotas-routing-module';
import { FormularioMascota } from './paginas/formulario-mascota/formulario-mascota';
import { ListaMascotas } from './paginas/lista-mascotas/lista-mascotas';

@NgModule({
  declarations: [ListaMascotas, FormularioMascota, TablaMascotas, TarjetaMascota, DatosDueno],
  imports: [SharedModule, MascotasRoutingModule],
})
export class MascotasModule {}
