import { Provider } from '@angular/core';
import { MotorAlmacenamiento, MotorMemoria } from '../app/core/almacenamiento/motor-almacenamiento';
import { Duenos } from '../app/mascotas/servicios/duenos';
import { Citas } from '../app/citas/servicios/citas';
import { Usuarios } from '../app/auth/servicios/usuarios';

export const PROVEEDORES_MEMORIA: Provider[] = [{ provide: MotorAlmacenamiento, useClass: MotorMemoria }];

export function sinRetardos(...servicios: (Duenos | Citas | Usuarios)[]): void {
  for (const servicio of servicios) {
    servicio.retardoVerificacion = 0;
  }
}
