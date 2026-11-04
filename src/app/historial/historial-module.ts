import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { DetalleAtencion } from './componentes/detalle-atencion/detalle-atencion';
import { FichaMascota } from './componentes/ficha-mascota/ficha-mascota';
import { LineaTiempo } from './componentes/linea-tiempo/linea-tiempo';
import { HistorialRoutingModule } from './historial-routing-module';
import { FormularioAtencion } from './paginas/formulario-atencion/formulario-atencion';
import { HistorialMascota } from './paginas/historial-mascota/historial-mascota';
import { SeleccionMascota } from './paginas/seleccion-mascota/seleccion-mascota';

@NgModule({
  declarations: [SeleccionMascota, HistorialMascota, FormularioAtencion, FichaMascota, LineaTiempo, DetalleAtencion],
  imports: [SharedModule, HistorialRoutingModule],
})
export class HistorialModule {}
