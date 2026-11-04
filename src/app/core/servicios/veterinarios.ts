import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Almacenamiento } from '../almacenamiento/almacenamiento';
import { ColeccionReactiva } from '../datos/coleccion-reactiva';
import { datosIniciales } from '../datos/datos-iniciales';
import { RepositorioLocal } from '../datos/repositorio-local';
import { esDatosVeterinario } from '../../shared/modelos/guardas';
import { DatosVeterinario, Veterinario } from '../../shared/modelos/veterinario';

@Injectable({ providedIn: 'root' })
export class Veterinarios extends ColeccionReactiva<DatosVeterinario> {
  private cache: readonly Veterinario[] = [];

  constructor(almacenamiento: Almacenamiento) {
    super(
      new RepositorioLocal<DatosVeterinario>(
        almacenamiento,
        'veterinarios',
        esDatosVeterinario,
        () => datosIniciales().veterinarios,
      ),
    );
    this.lista$.subscribe((lista) => {
      this.cache = lista.map((datos) => new Veterinario(datos));
    });
  }

  public get todos(): readonly Veterinario[] {
    return this.cache;
  }

  public get veterinarios$(): Observable<readonly Veterinario[]> {
    return this.lista$.pipe(map(() => this.cache));
  }

  public obtenerVeterinario(id: string | null | undefined): Veterinario | undefined {
    return this.cache.find((veterinario) => veterinario.id === id);
  }

  public nombreDe(id: string): string {
    return this.obtenerVeterinario(id)?.nombreCorto ?? 'Sin asignar';
  }
}
