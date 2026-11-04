import { Injectable } from '@angular/core';
import { Observable, map, timer } from 'rxjs';
import { Almacenamiento } from '../../core/almacenamiento/almacenamiento';
import { ColeccionReactiva } from '../../core/datos/coleccion-reactiva';
import { datosIniciales } from '../../core/datos/datos-iniciales';
import { RepositorioLocal } from '../../core/datos/repositorio-local';
import { DatosDueno, Dueno, NuevoDueno } from '../../shared/modelos/dueno';
import { esDatosDueno } from '../../shared/modelos/guardas';
import { generarId, ordenarPor } from '../../shared/utilidades/colecciones';

@Injectable({ providedIn: 'root' })
export class Duenos extends ColeccionReactiva<DatosDueno> {
  public retardoVerificacion = 300;
  private cache: readonly Dueno[] = [];

  constructor(almacenamiento: Almacenamiento) {
    super(
      new RepositorioLocal<DatosDueno>(almacenamiento, 'duenos', esDatosDueno, () => datosIniciales().duenos),
    );
    this.lista$.subscribe((lista) => {
      this.cache = ordenarPor(
        lista.map((datos) => new Dueno(datos)),
        (dueno) => dueno.apellidos,
      );
    });
  }

  public get todos(): readonly Dueno[] {
    return this.cache;
  }

  public get duenos$(): Observable<readonly Dueno[]> {
    return this.lista$.pipe(map(() => this.cache));
  }

  public obtenerDueno(id: string | null | undefined): Dueno | undefined {
    return this.cache.find((dueno) => dueno.id === id);
  }

  public buscarPorDocumento(documento: string): Dueno | undefined {
    return this.cache.find((dueno) => dueno.documento === documento.trim());
  }

  public registrar(datos: NuevoDueno): Dueno {
    const dueno = new Dueno({ ...datos, id: generarId('due') });
    this.agregar(dueno.toJSON());
    return dueno;
  }

  public actualizarDatos(id: string, cambios: Partial<NuevoDueno>): Dueno | undefined {
    const actualizado = this.modificar(id, cambios);
    return actualizado ? new Dueno(actualizado) : undefined;
  }

  public documentoDisponible(documento: string, excluirId: string | null = null): Observable<boolean> {
    return timer(this.retardoVerificacion).pipe(
      map(() => {
        const existente = this.buscarPorDocumento(documento);
        return !existente || existente.id === excluirId;
      }),
    );
  }
}
