import { Pipe, PipeTransform } from '@angular/core';
import { ESPECIES } from '../modelos/especie';
import { esRol, esTipoEspecie, esTipoServicio } from '../modelos/guardas';
import { ETIQUETAS_ROL, ETIQUETAS_SERVICIO } from '../modelos/tipos';

@Pipe({
  name: 'especie',
  standalone: false,
})
export class NombreEspecie implements PipeTransform {
  public transform(codigo: string | null | undefined): string {
    return esTipoEspecie(codigo) ? ESPECIES[codigo].nombre : '';
  }
}

@Pipe({
  name: 'servicio',
  standalone: false,
})
export class EtiquetaServicio implements PipeTransform {
  public transform(tipo: string | null | undefined): string {
    return esTipoServicio(tipo) ? ETIQUETAS_SERVICIO[tipo] : '';
  }
}

@Pipe({
  name: 'rol',
  standalone: false,
})
export class EtiquetaRol implements PipeTransform {
  public transform(rol: string | null | undefined): string {
    return esRol(rol) ? ETIQUETAS_ROL[rol] : '';
  }
}
