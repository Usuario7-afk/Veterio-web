import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AvatarEspecie } from './componentes/avatar-especie/avatar-especie';
import { BuscadorTexto } from './componentes/buscador-texto/buscador-texto';
import { EncabezadoPagina } from './componentes/encabezado-pagina/encabezado-pagina';
import { ErroresCampo } from './componentes/errores-campo/errores-campo';
import { EstadoVacio } from './componentes/estado-vacio/estado-vacio';
import { InsigniaEstado } from './componentes/insignia-estado/insignia-estado';
import { Logo } from './componentes/logo/logo';
import { ModalConfirmacion } from './componentes/modal-confirmacion/modal-confirmacion';
import { SeccionNumerada } from './componentes/seccion-numerada/seccion-numerada';
import { TarjetaCita } from './componentes/tarjeta-cita/tarjeta-cita';
import { TarjetaPersona } from './componentes/tarjeta-persona/tarjeta-persona';
import { TarjetaResumen } from './componentes/tarjeta-resumen/tarjeta-resumen';
import { Autoenfoque } from './directivas/autoenfoque';
import { ConfirmarAccion } from './directivas/confirmar-accion';
import { ResaltarProxima } from './directivas/resaltar-proxima';
import { SoloNumeros } from './directivas/solo-numeros';
import { TieneRol } from './directivas/tiene-rol';
import { EdadMascota } from './pipes/edad-mascota';
import { EtiquetaEstado } from './pipes/etiqueta-estado';
import { EtiquetaRol, EtiquetaServicio, NombreEspecie } from './pipes/etiquetas';
import { FechaHora } from './pipes/fecha-hora';
import { Hora12, Soles, Telefono, TiempoRestante } from './pipes/formatos';

const COMPONENTES = [
  AvatarEspecie,
  BuscadorTexto,
  EncabezadoPagina,
  ErroresCampo,
  EstadoVacio,
  InsigniaEstado,
  Logo,
  ModalConfirmacion,
  SeccionNumerada,
  TarjetaCita,
  TarjetaPersona,
  TarjetaResumen,
];

const DIRECTIVAS = [Autoenfoque, ConfirmarAccion, ResaltarProxima, SoloNumeros, TieneRol];

const PIPES = [
  EdadMascota,
  EtiquetaEstado,
  EtiquetaRol,
  EtiquetaServicio,
  FechaHora,
  Hora12,
  NombreEspecie,
  Soles,
  Telefono,
  TiempoRestante,
];

@NgModule({
  declarations: [...COMPONENTES, ...DIRECTIVAS, ...PIPES],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  exports: [CommonModule, ReactiveFormsModule, RouterModule, ...COMPONENTES, ...DIRECTIVAS, ...PIPES],
})
export class SharedModule {}
