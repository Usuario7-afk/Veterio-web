import { NgModule, Optional, SkipSelf } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { MotorAlmacenamiento, MotorLocalStorage } from './almacenamiento/motor-almacenamiento';
import { ContenedorToasts } from './layout/contenedor-toasts/contenedor-toasts';
import { LayoutPrincipal } from './layout/layout-principal/layout-principal';
import { MenuLateral } from './layout/menu-lateral/menu-lateral';

@NgModule({
  declarations: [LayoutPrincipal, MenuLateral, ContenedorToasts],
  imports: [SharedModule],
  exports: [LayoutPrincipal],
  providers: [{ provide: MotorAlmacenamiento, useClass: MotorLocalStorage }],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() moduloPadre: CoreModule | null) {
    if (moduloPadre) {
      throw new Error('CoreModule ya fue cargado. Impórtalo solo en AppModule.');
    }
  }
}
